# UZTMK — National Industrial Situation Center
## React + TypeScript Dashboard

### O'rnatish va ishga tushirish

```bash
# 1. Papkaga kiring
cd uztmk-dashboard

# 2. Paketlarni o'rnating
npm install

# 3. Development serverini ishga tushiring
npm start
```

Brauzer avtomatik ravishda `http://localhost:3000` da ochiladi.

---

### Loyiha strukturasi

```
src/
├── types/
│   └── index.ts              # TypeScript interfeyslari va typelar
├── data/
│   └── constants.ts          # Barcha ma'lumotlar (facilities, projects, alerts...)
├── hooks/
│   ├── useClock.ts           # Real-time soat hook
│   └── useAnimatedCounter.ts # Animatsiyali raqam count hook
└── components/
    ├── Header.tsx            # Yuqori panel (logo, soat, SYSTEM LIVE)
    ├── LeftPanel.tsx         # Chap panel (KPI kartalar + chartlar)
    ├── CenterPanel.tsx       # Markaziy panel (pipeline + xarita)
    ├── RightPanel.tsx        # O'ng panel (gaugelar + monitoring)
    ├── KpiCard.tsx           # KPI kartochka komponenti
    ├── Charts.tsx            # Barcha chart komponentlari (Line/Bar/Pie/Realtime/Energy)
    ├── Gauge.tsx             # Doiraviy gauge komponenti
    ├── PipelineSection.tsx   # Upstream/Midstream/Downstream pipeline
    ├── MapSection.tsx        # MapLibre GL xarita
    ├── AlertsSection.tsx     # Jonli operatsional alertlar
    ├── ProjectsSection.tsx   # Faol loyihalar progress bar
    └── Ticker.tsx            # Pastki ticker lenta
```

### Ishlatilgan texnologiyalar

- **React 18** — UI framework
- **TypeScript** — Type safety
- **react-chartjs-2 + Chart.js** — Barcha chartlar
- **MapLibre GL** — Interaktiv xarita (CDN orqali)
- **Google Fonts** — Orbitron, Share Tech Mono, Exo 2

### Xususiyatlar

- ⚡ Real-time soat va sana
- 📊 Animatsiyali KPI counterlar
- 📈 Live throughput chart (1.2s interval)
- 🗺️ MapLibre xarita (O'zbekiston sanoat ob'ektlari)
- 🔔 Jonli operatsional alertlar (5.5s interval)
- ⚙️ Gauge animatsiyalari (4s interval)
- 📦 Pipeline operatsion qiymatlar (3.8s interval)
- 🎞️ Ticker lenta animatsiyasi
