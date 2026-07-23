export type ResearchHorizon = 3 | 6;

export type ResearchTarget = {
  horizonMonths: ResearchHorizon;
  targetPrice: number;
  resolveDate: string;
  /** 到期後由主辦方鎖定的實際收盤價；未到期時留空並使用即時行情。 */
  settledPrice?: number;
};

export type ResearchReport = {
  id: string;
  roundId: "r01" | "r02" | "r03";
  participantId: string;
  analyst: string;
  initials: string;
  color: string;
  instrument: string;
  symbol: string;
  displaySymbol: string;
  currency: "TWD" | "USD";
  unit?: string;
  reportDate: string;
  referenceDate: string;
  referencePrice: number;
  rating: string;
  targets: ResearchTarget[];
};

export const RESEARCH_REPORT_ROUNDS = [
  {
    id: "r01",
    label: "第 1 份",
    monthLabel: "2026 年 7 月",
    status: "published",
  },
  {
    id: "r02",
    label: "第 2 份",
    monthLabel: "2026 年 8 月",
    status: "upcoming",
  },
  {
    id: "r03",
    label: "第 3 份",
    monthLabel: "2026 年 9 月",
    status: "upcoming",
  },
] as const;

export const RESEARCH_REPORTS: ResearchReport[] = [
  {
    id: "r01-little-leek-umc",
    roundId: "r01",
    participantId: "little-leek",
    analyst: "小韭菜",
    initials: "韭",
    color: "#34d399",
    instrument: "聯電",
    symbol: "2303",
    displaySymbol: "2303.TW",
    currency: "TWD",
    reportDate: "2026-07-21",
    referenceDate: "2026-07-20",
    referencePrice: 130,
    rating: "買進",
    targets: [
      { horizonMonths: 3, targetPrice: 155, resolveDate: "2026-10-21" },
      { horizonMonths: 6, targetPrice: 172, resolveDate: "2027-01-21" },
    ],
  },
  {
    id: "r01-gull-helmet-nanya",
    roundId: "r01",
    participantId: "gull-helmet",
    analyst: "鷗盔",
    initials: "鷗",
    color: "#60a5fa",
    instrument: "南亞科",
    symbol: "2408",
    displaySymbol: "2408.TW",
    currency: "TWD",
    reportDate: "2026-07-20",
    referenceDate: "2026-07-17",
    referencePrice: 395.5,
    rating: "買進",
    targets: [
      { horizonMonths: 3, targetPrice: 500, resolveDate: "2026-10-20" },
      { horizonMonths: 6, targetPrice: 580, resolveDate: "2027-01-20" },
    ],
  },
  {
    id: "r01-strawberry-silver",
    roundId: "r01",
    participantId: "strawberry-barry",
    analyst: "草莓貝瑞 Straw Barry",
    initials: "莓",
    color: "#fb7185",
    instrument: "白銀",
    symbol: "XAG",
    displaySymbol: "XAG/USD",
    currency: "USD",
    unit: "/ oz",
    reportDate: "2026-07-21",
    referenceDate: "2026-07-21",
    referencePrice: 57.2,
    rating: "中立（區間操作）",
    targets: [
      { horizonMonths: 3, targetPrice: 58.5, resolveDate: "2026-10-21" },
      { horizonMonths: 6, targetPrice: 64, resolveDate: "2027-01-21" },
    ],
  },
  {
    id: "r01-project-d-mediatek",
    roundId: "r01",
    participantId: "project-d",
    analyst: "Project D",
    initials: "D",
    color: "#22d3ee",
    instrument: "聯發科",
    symbol: "2454",
    displaySymbol: "2454.TW",
    currency: "TWD",
    reportDate: "2026-07-21",
    referenceDate: "2026-07-21",
    referencePrice: 3610,
    rating: "中立偏多（持有）",
    targets: [
      { horizonMonths: 3, targetPrice: 3800, resolveDate: "2026-10-21" },
      { horizonMonths: 6, targetPrice: 4180, resolveDate: "2027-01-21" },
    ],
  },
  {
    id: "r01-princess-macronix",
    roundId: "r01",
    participantId: "princess-yuanying",
    analyst: "員瑛公主",
    initials: "瑛",
    color: "#e879f9",
    instrument: "旺宏",
    symbol: "2337",
    displaySymbol: "2337.TW",
    currency: "TWD",
    reportDate: "2026-07-20",
    referenceDate: "2026-07-20",
    referencePrice: 118.5,
    rating: "買進（區間偏多）",
    targets: [
      { horizonMonths: 3, targetPrice: 150, resolveDate: "2026-10-20" },
      { horizonMonths: 6, targetPrice: 175, resolveDate: "2027-01-20" },
    ],
  },
  {
    id: "r01-eagle-ethereum",
    roundId: "r01",
    participantId: "eagle",
    analyst: "歐鷹",
    initials: "鷹",
    color: "#a78bfa",
    instrument: "以太坊",
    symbol: "ETH",
    displaySymbol: "ETH/USD",
    currency: "USD",
    reportDate: "2026-07-20",
    referenceDate: "2026-07-19",
    referencePrice: 1866,
    rating: "買進（分批布局）",
    targets: [
      { horizonMonths: 3, targetPrice: 2300, resolveDate: "2026-10-20" },
      { horizonMonths: 6, targetPrice: 2800, resolveDate: "2027-01-20" },
    ],
  },
  {
    id: "r01-guinea-pig-wiwynn",
    roundId: "r01",
    participantId: "guinea-pig",
    analyst: "天竺鼠車隊",
    initials: "鼠",
    color: "#fb923c",
    instrument: "緯穎",
    symbol: "6669",
    displaySymbol: "6669.TW",
    currency: "TWD",
    reportDate: "2026-07-20",
    referenceDate: "2026-07-20",
    referencePrice: 4685,
    rating: "區間偏多",
    targets: [
      { horizonMonths: 3, targetPrice: 5200, resolveDate: "2026-10-20" },
      { horizonMonths: 6, targetPrice: 5650, resolveDate: "2027-01-20" },
    ],
  },
  {
    id: "r01-redrock-yageo",
    roundId: "r01",
    participantId: "redrock-research",
    analyst: "RedRock Research",
    initials: "R",
    color: "#fbbf24",
    instrument: "國巨",
    symbol: "2327",
    displaySymbol: "2327.TW",
    currency: "TWD",
    reportDate: "2026-07-20",
    referenceDate: "2026-07-20",
    referencePrice: 630,
    rating: "增持",
    targets: [
      { horizonMonths: 3, targetPrice: 780, resolveDate: "2026-10-20" },
      { horizonMonths: 6, targetPrice: 950, resolveDate: "2027-01-20" },
    ],
  },
];

export const RESEARCH_PARTICIPANTS = [
  ...new Map(
    RESEARCH_REPORTS.map((report) => [
      report.participantId,
      {
        id: report.participantId,
        analyst: report.analyst,
        initials: report.initials,
        color: report.color,
      },
    ]),
  ).values(),
];

export const RESEARCH_PRICE_SYMBOLS = [...new Set(RESEARCH_REPORTS.map((report) => report.symbol))];

export const RESEARCH_TOTAL_OPPORTUNITIES = RESEARCH_PARTICIPANTS.length * 3 * 2;

export function researchDistancePct(targetPrice: number, actualPrice: number): number {
  if (!Number.isFinite(targetPrice) || !Number.isFinite(actualPrice) || actualPrice <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return (Math.abs(targetPrice - actualPrice) / actualPrice) * 100;
}
