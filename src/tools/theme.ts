import { IThemeProvider, SciChartJsNavyTheme } from "scichart";
import { GC, alpha } from "../theme/palette";

/**
 * SciChart uchun mavzu. Ranglar `src/theme/palette.ts` dagi yagona palitradan
 * olinadi — bu yerda hech qanday hex qattiq yozilmaydi.
 *
 * Vivid / Muted / Pale — bir xil semantik rangning to'yinganlik darajalari:
 * ko'p seriyali grafiklarda chiziqlar farqlanib turishi uchun kerak.
 */
export interface AppThemeBase {
    SciChartJsTheme: IThemeProvider;

    // general colors
    ForegroundColor: string;
    Background: string;

    // Series colors
    VividSkyBlue: string;
    VividPink: string;
    VividTeal: string;
    VividOrange: string;
    VividBlue: string;
    VividPurple: string;
    VividGreen: string;
    VividRed: string;

    MutedSkyBlue: string;
    MutedPink: string;
    MutedTeal: string;
    MutedOrange: string;
    MutedBlue: string;
    MutedPurple: string;
    MutedRed: string;

    PaleSkyBlue: string;
    PalePink: string;
    PaleTeal: string;
    PaleOrange: string;
    PaleBlue: string;
    PalePurple: string;
}

/** Muted — 70% to'yinganlik, Pale — 35%. */
const muted = (c: string) => alpha(c, 0.7);
const pale = (c: string) => alpha(c, 0.35);

export class SciChart2022AppTheme implements AppThemeBase {
    SciChartJsTheme = new SciChartJsNavyTheme();

    // General colors
    ForegroundColor = GC.white;
    Background = this.SciChartJsTheme.sciChartBackground;

    // Series colors — palitraning semantik tokenlari
    VividSkyBlue = GC.cyan;
    VividPink = GC.magenta;
    VividTeal = GC.green;
    VividOrange = GC.amber;
    VividBlue = GC.blue;
    VividPurple = GC.violet;
    VividGreen = GC.green;
    VividRed = GC.red;

    DarkIndigo = GC.panelBg;
    Indigo = GC.deep;

    MutedSkyBlue = muted(GC.cyan);
    MutedPink = muted(GC.magenta);
    MutedTeal = muted(GC.green);
    MutedOrange = muted(GC.amber);
    MutedBlue = muted(GC.blue);
    MutedPurple = muted(GC.violet);
    MutedRed = muted(GC.red);

    PaleSkyBlue = pale(GC.cyan);
    PalePink = pale(GC.magenta);
    PaleTeal = pale(GC.green);
    PaleOrange = pale(GC.amber);
    PaleBlue = pale(GC.blue);
    PalePurple = pale(GC.violet);
}

export const appTheme = new SciChart2022AppTheme();
