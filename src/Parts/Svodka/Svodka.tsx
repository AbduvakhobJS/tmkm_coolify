import React from 'react';
import { useAuthToken } from './api/auth';
import { Dashboard } from './Dashboard';
import './svodka.css';

/**
 * «Сводка» бўлими — `production-report` API устидаги дашборд.
 *
 * Логин экрани йўқ: маршрут `PrivateRoute` ичида турибди ва токен хост
 * илованинг `localStorage` идан олинади (қаранг: `api/auth.ts`). Токен
 * топилмаса — фойдаланувчидан ҳеч нарса сўралмайди, шунчаки сабаби кўрсатилади.
 *
 * `svodka-dash` синфи муҳим: дашборднинг барча CSS токенлари ва базавий
 * стиллари шу элемент ичида чекланган, шунда `App.css` даги ситуацион марказ
 * темаси билан аралашиб кетмайди (қаранг: `svodka.css`).
 */
const Svodka: React.FC = () => {
    const token = useAuthToken();

    return (
        <div className="svodka-dash">
            {token ? <Dashboard /> : <NoToken />}
        </div>
    );
};

const NoToken: React.FC = () => (
    <main className="mx-auto flex min-h-[60vh] max-w-[520px] flex-col justify-center px-5 py-10">
        <div
            role="alert"
            className="sv-card px-5 py-6"
            style={{ borderLeft: '3px solid var(--crit)' }}
        >
            <p className="text-[13.5px] [font-weight:650] text-ink">Kirish tokeni topilmadi</p>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-ink-2">
                Dashbord tokenni tizimning umumiy seansidan oladi. Tizimdan chiqib, qaytadan
                kiring.
            </p>
        </div>
    </main>
);

export default Svodka;
