import { useMemo } from "react";
import type { PanelProps } from "../types";
import { getSalesProducts } from "../api/endpoints";
import { useQuery } from "../lib/useQuery";
import { dateLabel, periodLabel, exact } from "../lib/format";
import {
  materialLabel,
  salesByProduct,
  type SalesProduct,
  type SalesUnitGroup,
} from "../lib/adapters/sales";
import { sgpSuspectKind, sgpSuspectReason } from "../lib/dataQuality";
import { Card, Section } from "../components/Card";
import { Pill } from "../components/Pill";
import { Banner } from "../components/Banner";
import { BarsH } from "../components/BarsH";
import { DataTable } from "../components/DataTable";
import { Loader } from "../components/states";

/**
 * Сони ишончсиз маҳсулот — **қиймат кўрсатилади**, ёнида огоҳлантириш белгиси.
 *
 * Аввал сон бутунлай яширилар эди. Энди базадаги қиймат қандай бўлса шундай
 * чиқади: раҳбар рақамни кўриши керак, лекин унинг ишончсизлигини ҳам билиши
 * керак. Белги устига келтирилса сабаби кўринади.
 */
function SuspectValue({
  value,
  reason,
  kind,
}: {
  value: number;
  reason: string;
  kind: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={`${kind}: ${reason}`}>
      <span className="font-mono tabular-nums text-warn-ink">{exact(value)}</span>
      <span aria-label="o'lchov birligi shubhali" className="text-[11px] text-warn-ink">
        ⚠
      </span>
    </span>
  );
}

function UnitGroup({ g, isStock }: { g: SalesUnitGroup; isStock: boolean }) {
  // Диаграммага фақат сони ишончли маҳсулотлар тушади: шубҳали қаторнинг
  // устуни қолганларини кўринмас қилиб юборарди.
  const clean = g.products.filter((p) => !p.suspect && (p.value ?? 0) > 0);

  return (
    <Card
      title={`${g.label}`}
      sub={`${g.products.length} mahsulot${g.suspectCount ? ` · ${g.suspectCount} tasi tekshirilmoqda` : ""}`}
    >
      {clean.length > 0 ? (
        <BarsH
          ariaLabel={`SGP — ${g.label} kesimida mahsulotlar`}
          rows={clean.map((p) => ({
            label: p.name,
            v: p.value ?? 0,
            extra: ["Metall", materialLabel(p.material)],
          }))}
          rowH={26}
          padR={92}
          vName={isStock ? "Qoldiq" : "Realizatsiya"}
          vFmt={(v) => exact(v) + " " + g.label}
        />
      ) : (
        <p className="rounded-md border border-hair bg-sunken px-3 py-4 text-center text-[12px] leading-normal text-ink-3">
          Bu birlikda soni ishonchli mahsulot yo'q.
        </p>
      )}

      <div className="mt-3">
        <DataTable
          caption={`SGP — ${g.label}`}
          cols={[
            { t: "Mahsulot", wrap: true },
            { t: "Metall" },
            { t: isStock ? "Qoldiq" : "Hajm", num: true },
          ]}
          rows={g.products.map((p: SalesProduct) => {
            const reason = sgpSuspectReason(p);
            return {
              key: String(p.id),
              cells: [
                p.name,
                <span className="text-ink-3">{materialLabel(p.material)}</span>,
                reason ? (
                  <SuspectValue
                    value={p.value ?? 0}
                    reason={reason}
                    kind={sgpSuspectKind(p)}
                  />
                ) : (
                  exact(p.value ?? 0)
                ),
              ],
            };
          })}
        />
      </div>
    </Card>
  );
}

/**
 * СГП — сотиш ва қолдиқлар, маҳсулот кесимида.
 *
 * Икки муҳим қоида:
 *  1. **Категориялар ўзаро таққосланмайди** ва умумий йиғинди йўқ — реализация
 *     оқим, қолдиқ эса ҳолат.
 *  2. **Ўлчов бирликлари аралаштирилмайди** — ҳар бир бирлик ўз картасида,
 *     ўз шкаласида (тн, кг, дона, п/м бир диаграммага тушмайди).
 */
export function SgpPanel({ period, months }: PanelProps) {
  const key = `${period.from}_${period.to}`;
  const q = useQuery(`sales-products_${key}`, (s) => getSalesProducts(period, s));

  const cats = useMemo(() => (q.data ? salesByProduct(q.data) : []), [q.data]);
  const totalSuspect = cats.reduce((a, c) => a + c.suspectCount, 0);

  return (
    <>
      <Banner tone="info">
        <b>Kategoriyalar o'zaro taqqoslanmaydi.</b> «Realizatsiya» — davr ichidagi oqim (yig'iladi),
        «Ostatki» esa davr oxiridagi holat (yig'ilmaydi). Shuning uchun umumiy yig'indi
        hisoblanmaydi. O'lchov birliklari ham aralashtirilmaydi — tonna, kilogramm va dona
        alohida ko'rsatiladi.
      </Banner>

      {totalSuspect > 0 && (
        <Banner tone="warn">
          <b>{totalSuspect} ta mahsulotning o'lchov birligi shubhali</b> — qiymat jadvalda
          bazadagi holicha ko'rsatiladi, yonida <span className="text-warn-ink">⚠</span> belgisi
          turadi. Bekend buni <code>unitSuspect</code> bayrog'i bilan belgilaydi:{" "}
          <b>davr ichida sakrash</b> — qiymatlar keskin farq qilgan (tonnadan kilogrammga
          o'tilganga o'xshaydi); <b>birlik yorlig'i</b> — qiymat barqaror, lekin ishlab chiqarish
          sur'atiga mos kelmaydi. Belgi ustiga keltirilsa aniq sababi ko'rinadi.
          Diagrammada ular yo'q: bitta o'ta katta ustun qolgan mahsulotlarni
          ko'rinmas qilib qo'yadi — to'liq ro'yxat jadvalda.
        </Banner>
      )}

      <Loader
        q={q}
        height={260}
        notAvailableWhat="/sales/products"
        isEmpty={() => cats.length === 0}
        emptyTitle="Ushbu davr uchun SGP ma'lumoti yo'q"
        emptyText="Tanlangan oylarda «Realizatsiya» va «Ostatki» satrlari kiritilmagan."
      >
        {() => (
          <>
            {cats.map((c, ci) => (
              <Section
                key={c.category}
                className={ci === 0 ? undefined : "mt-1"}
                title={c.label}
                note={
                  c.isStock
                    ? `${c.lastDay ? dateLabel(c.lastDay) : periodLabel(months)} holatiga · ${c.productCount} mahsulot`
                    : `${periodLabel(months)} · ${c.productCount} mahsulot`
                }
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <Pill>{c.isStock ? "holat — yig'ilmaydi" : "oqim — davr bo'yicha yig'indi"}</Pill>
                  {c.units.map((u) => (
                    <Pill key={u.unit}>{u.label}: {u.products.length} ta</Pill>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3 wide:grid-cols-2">
                  {c.units.map((u) => (
                    <UnitGroup key={u.unit} g={u} isStock={c.isStock} />
                  ))}
                </div>
              </Section>
            ))}
          </>
        )}
      </Loader>
    </>
  );
}
