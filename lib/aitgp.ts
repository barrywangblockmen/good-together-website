// AI Trading Grand Prix (AITGP) 賽事資料層
// 全部資料皆為手動維護，暫不即時更新。日後補上其餘車隊與各站盈虧，只需編輯本檔。

export type TradeDirection = "long" | "short";

export type MainLeg = {
  symbol: string;
  label?: string;
  direction: TradeDirection;
  /** 開倉價 */
  entryPrice?: string;
  /** 平倉／結算價；與 entryPrice 同時存在時可自動計算盈虧 % */
  exitPrice?: string;
  /** 盈虧 %；可直接填入，或由 entryPrice + exitPrice 推算 */
  returnPct?: number;
  /** 期貨所契約月份，例如 MTX 用 202607 */
  taifexContract?: string;
};

export type SprintLeg = {
  symbol: string;
  label?: string;
  /** 進場價 */
  entryPrice?: string;
  /** 結算價；與 entryPrice 同時存在時可自動計算漲跌 % */
  exitPrice?: string;
  /** 漲跌 %；可直接填入，或由 entryPrice + exitPrice 推算 */
  returnPct?: number;
  /** 期貨所契約月份，例如 MTX 用 202607 */
  taifexContract?: string;
};

export type Team = {
  id: string;
  name: string;
  driver: string;
  /** 車隊代表色（livery 主色），用於卡片與佔位視覺 */
  color: string;
  /** 一句車隊簡介 / slogan */
  blurb?: string;
  /** 車隊 Logo 圖片路徑（public 起算）；佔位車隊留空 */
  logo?: string;
  /** 賽車圖片路徑（public 起算）；佔位車隊留空 */
  car?: string;
  isPlaceholder?: boolean;
};

export type RoundStatus = "warmup" | "upcoming" | "racing" | "settled";

export type Round = {
  id: string;
  /** 顯示用站號，例如 R01；暖身週為 GP0 */
  code: string;
  name: string;
  theme: string;
  circuit: string;
  tradingPeriod: string;
  settleDate: string;
  status: RoundStatus;
  note?: string;
};

export type RoundEntry = {
  teamId: string;
  roundId: string;
  main: MainLeg[];
  sprint: SprintLeg[];
  /** 該站賽季積分（主賽名次給分）；尚未結算則留空 */
  points?: number;
  /** 是否為示意資料（賽季尚未開跑） */
  sample?: boolean;
};

// 主賽獎金（每站總額 50 USDT）
export const MAIN_PRIZES = [
  { place: "第一名", reward: "25 USDT" },
  { place: "第二名", reward: "15 USDT" },
  { place: "第三名", reward: "10 USDT" },
] as const;

// 賽季積分表（每站給分，累積年度成績）
export const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;

export const ANNUAL_AWARDS = [
  { title: "年度車隊冠軍", desc: "總積分最高" },
  { title: "最佳 AI 車隊設計", desc: "Logo、賽車、故事設定最佳" },
] as const;

export const RACE_FORMATS = [
  {
    key: "main",
    badge: "主賽 · GP Race",
    title: "盈虧率賽",
    skill: "交易能力",
    desc: "每站選 2 個標的，可做多、可做空，限 1x 槓桿且須符合標的規範（見下方）。賽期內可自由選擇進、出場時機，但每個標的僅限一次（開倉一次、平倉一次）。主賽不鎖定標的，各隊可選到相同標的。成績取兩個標的報酬率的平均。",
  },
  {
    key: "sprint",
    badge: "副賽 · Sprint Race",
    title: "股價表現賽",
    skill: "選股能力",
    desc: "每站選 2 個標的，只能做多（可全程 HODL），且須符合標的規範（見下方）。進場限定賽期前兩天（週一、週二），先喊先贏鎖定標的，以選定時價格起算，至賽期最後一天收盤統一結算。副賽標的各隊不得重複。成績取兩個標的表現平均。",
  },
] as const;

/** 主賽／副賽可選標的與 1x 槓桿定義（自 R01 起適用；GP0 暖身週僅供練習） */
export const INSTRUMENT_RULES = {
  title: "標的與槓桿規範",
  summary:
    "本賽事比的是 1x 曝險下的選股與交易紀律；禁止以選擇權等內含槓桿的商品放大報酬率。",
  allowed: [
    "上市／上櫃現股、一般 ETF（非槓桿、非反向）",
    "指數期貨（限 1 口標準／小口，不得額外融資或放大的保證金操作）",
    "加密資產（限 1x，合約須關閉槓桿放大）",
  ],
  prohibited: [
    "選擇權（含買權、賣權、週選、月選）",
    "權證、牛熊證、可轉債等具內含槓桿或不對稱損益結構之商品",
    "槓桿／反向 ETF、結構型商品",
    "任何以少額保證金或權利金承擔超過 1x 曝險之操作（含賣出選擇權）",
  ],
  leverageNote:
    "「1x 槓桿」指單一標的之盈虧 % 應與標的本身價格漲跌幅相當；不得以權利金、保證金倍數等方式使報酬率脫離標的漲跌。",
  violation:
    "正式站次（R01 起）若使用禁止標的，該標的不計入當站成績；無法於賽期內替換者，該標的以 0% 計。",
} as const;

export const ROUND_RULES = [
  "主賽標的不鎖定，各隊可選相同標的；賽期內每標的僅限開倉、平倉各一次。",
  "副賽標的先喊先贏、不得重複；進場限定賽期前兩天，最後一天統一結算。",
  "主賽、副賽標的均須符合「標的與槓桿規範」；選擇權及內含槓桿之衍生品禁止參賽。",
  "可用現有持倉參賽：起始開倉價以當期週一開盤價為準；未平倉則以當期週五收盤價結算。",
  "固定線上會議：每週一 16:00（AI 實作坊結束後）。副賽須於賽期前兩天進場並提交截圖；主賽進場時點自由。",
] as const;

export const POINTS_NOTE =
  "主賽與副賽積分分開計算（每站各依名次給分）；年度排名以主賽 + 副賽總積分合計。";

export const SEASON_LABEL = "2026 賽季";
export const SEASON_KICKOFF = "2026 年 6 月 29 日（建隊週）";

export const TEAMS: Team[] = [
  {
    id: "strawberry-berry",
    name: "草莓貝瑞車隊",
    driver: "Barry",
    color: "#FF4D6D",
    blurb: "用 AI 整理財報、抓進出場點位，紀律進場、設好目標價再放著。",
    logo: "/aitgp/teams/strawberry-berry/logo.png",
    car: "/aitgp/teams/strawberry-berry/car.png",
  },
  {
    id: "project-d",
    name: "Project D車隊",
    driver: "Eli",
    color: "#00D4FF",
  },
  {
    id: "redrock-racing",
    name: "RedRock Racing 紅石車隊",
    driver: "Simon",
    color: "#D4A24E",
    logo: "/aitgp/teams/redrock-racing/logo.png",
    car: "/aitgp/teams/redrock-racing/car.png",
  },
  {
    id: "princess-yuanying",
    name: "員瑛公主車隊",
    driver: "Sheena",
    color: "#E040FB",
    blurb: "Princess Racing Team — 皇冠加冕，紅鑽閃耀賽道。",
    logo: "/aitgp/teams/princess-yuanying/logo.png",
    car: "/aitgp/teams/princess-yuanying/car.png",
  },
  {
    id: "guinea-pig",
    name: "天竺鼠車隊",
    driver: "Nora",
    color: "#FF9500",
    blurb: "Guinea Pig Racing — 天竺鼠出擊，WHEEK 全速前進。",
    logo: "/aitgp/teams/guinea-pig/logo.png",
    car: "/aitgp/teams/guinea-pig/car.png",
  },
  {
    id: "money-queue",
    name: "賺錢要排隊",
    driver: "Ken",
    color: "#4CD964",
  },
  {
    id: "one-more-order",
    name: "再凹單就會隊",
    driver: "Sam",
    color: "#AF52DE",
  },
  {
    id: "youre-right",
    name: "你說的都隊",
    driver: "Muriel",
    color: "#5B8DEF",
  },
];

export const ROUNDS: Round[] = [
  {
    id: "warmup",
    code: "GP0",
    name: "台灣站 Taiwan GP",
    theme: "建隊暖身週",
    circuit: "台股 / 美股 / 加密 · 暖身賽",
    tradingPeriod: "6/29（一）– 7/3（五）",
    settleDate: "7/6（一）公布",
    status: "racing",
    note: "標的可選台股／美股／加密任一。6/30（二）收盤前截圖開倉、7/3（五）前自選平倉，以截圖標記點位計算，純練習、不計入賽季積分。",
  },
  {
    id: "r01",
    code: "R01",
    name: "奧地利站 Austrian GP",
    theme: "Round 01",
    circuit: "Red Bull Ring",
    tradingPeriod: "7/6（一）– 7/17（五）",
    settleDate: "7/20（一）結算",
    status: "upcoming",
  },
  {
    id: "r02",
    code: "R02",
    name: "匈牙利站 Hungarian GP",
    theme: "Round 02",
    circuit: "Hungaroring",
    tradingPeriod: "7/27（一）– 8/7（五）",
    settleDate: "8/10（一）結算",
    status: "upcoming",
  },
  {
    id: "r03",
    code: "R03",
    name: "荷蘭站 Dutch GP",
    theme: "Round 03",
    circuit: "Zandvoort",
    tradingPeriod: "8/17（一）– 8/28（五）",
    settleDate: "8/31（一）結算",
    status: "upcoming",
  },
  {
    id: "r04",
    code: "R04",
    name: "西班牙站 Spanish GP",
    theme: "Round 04 · 馬德里",
    circuit: "Madring",
    tradingPeriod: "9/7（一）– 9/18（五）",
    settleDate: "9/21（一）結算",
    status: "upcoming",
  },
  {
    id: "r05",
    code: "R05",
    name: "新加坡站 Singapore GP",
    theme: "Round 05",
    circuit: "Marina Bay",
    tradingPeriod: "9/28（一）– 10/9（五）",
    settleDate: "10/12（一）結算",
    status: "upcoming",
  },
  {
    id: "r06",
    code: "R06",
    name: "美國站 United States GP",
    theme: "Round 06",
    circuit: "COTA, Austin",
    tradingPeriod: "10/19（一）– 10/30（五）",
    settleDate: "11/2（一）結算",
    status: "upcoming",
  },
  {
    id: "r07",
    code: "R07",
    name: "拉斯維加斯站 Las Vegas GP",
    theme: "Round 07",
    circuit: "Las Vegas Strip",
    tradingPeriod: "11/9（一）– 11/20（五）",
    settleDate: "11/23（一）結算",
    status: "upcoming",
  },
  {
    id: "r08",
    code: "R08",
    name: "阿布達比站 Abu Dhabi GP",
    theme: "Round 08 · 年度收官",
    circuit: "Yas Marina",
    tradingPeriod: "11/30（一）– 12/11（五）",
    settleDate: "12/14（一）總結算 + 年度頒獎",
    status: "upcoming",
  },
];

// 各站、各隊成績。賽季開跑後手動填入；暖身週 GP0 已開倉，盈虧待結算。
export const ROUND_ENTRIES: RoundEntry[] = [
  {
    teamId: "project-d",
    roundId: "warmup",
    main: [
      { symbol: "AAVE", direction: "long", entryPrice: "91.5" },
      { symbol: "2409", label: "友達", direction: "long", entryPrice: "30.6" },
    ],
    sprint: [
      { symbol: "AAVE", entryPrice: "91.5" },
      { symbol: "2409", label: "友達", entryPrice: "30.6" },
    ],
  },
  {
    teamId: "money-queue",
    roundId: "warmup",
    main: [
      { symbol: "2603", label: "長榮", direction: "long", entryPrice: "182.5" },
      { symbol: "2356", label: "英業達", direction: "long", entryPrice: "64.2" },
    ],
    sprint: [
      { symbol: "2603", label: "長榮", entryPrice: "182.5" },
      { symbol: "2356", label: "英業達", entryPrice: "64.2" },
    ],
  },
  {
    teamId: "strawberry-berry",
    roundId: "warmup",
    main: [
      { symbol: "PUMP", direction: "long", entryPrice: "0.001447" },
      { symbol: "HYPE", direction: "long", entryPrice: "62.714" },
    ],
    sprint: [
      { symbol: "XAUT", entryPrice: "4061.6" },
      { symbol: "MUUSDT", entryPrice: "1155.58" },
    ],
  },
  {
    teamId: "princess-yuanying",
    roundId: "warmup",
    main: [
      { symbol: "2337", label: "旺宏", direction: "long", entryPrice: "166" },
      { symbol: "3189", label: "景碩", direction: "long", entryPrice: "794" },
    ],
    sprint: [
      { symbol: "2337", label: "旺宏", entryPrice: "166" },
      { symbol: "3189", label: "景碩", entryPrice: "794" },
    ],
  },
  {
    teamId: "redrock-racing",
    roundId: "warmup",
    main: [
      { symbol: "8255", label: "朋程", direction: "long", entryPrice: "176.50" },
      { symbol: "SPCX", direction: "long", entryPrice: "155.34" },
    ],
    sprint: [
      { symbol: "2059", label: "川湖", entryPrice: "7110" },
      { symbol: "5536", label: "聖暉", entryPrice: "1245" },
    ],
  },
  {
    teamId: "one-more-order",
    roundId: "warmup",
    main: [
      { symbol: "MTX", label: "小台指期", direction: "long", entryPrice: "45558", taifexContract: "202607" },
      { symbol: "07w1 44500P", label: "小台 Put", direction: "short", entryPrice: "255" },
    ],
    sprint: [
      { symbol: "MTX", label: "小台指", entryPrice: "45558", taifexContract: "202607" },
      { symbol: "2408", label: "南亞科", entryPrice: "453" },
    ],
  },
  {
    teamId: "youre-right",
    roundId: "warmup",
    main: [
      { symbol: "2330", label: "台積電", direction: "long", entryPrice: "2330" },
      { symbol: "2308", label: "台達電", direction: "long", entryPrice: "1860" },
    ],
    sprint: [
      { symbol: "2330", label: "台積電", entryPrice: "2330" },
      { symbol: "2308", label: "台達電", entryPrice: "1860" },
    ],
  },
  {
    teamId: "guinea-pig",
    roundId: "warmup",
    main: [
      { symbol: "3481", label: "群創", direction: "long", entryPrice: "67" },
      { symbol: "6669", label: "緯穎", direction: "long", entryPrice: "4335" },
    ],
    sprint: [
      { symbol: "3481", label: "群創", entryPrice: "67" },
      { symbol: "6669", label: "緯穎", entryPrice: "4335" },
    ],
  },
];

/** 盈虧走勢圖用賽程（不含建隊週 GP0 暖身賽） */
export const CHART_ROUNDS = ROUNDS.filter((r) => r.id !== "warmup");

const team_index = new Map(TEAMS.map((t, i) => [t.id, i]));

export function getTeam(teamId: string): Team | undefined {
  return TEAMS[team_index.get(teamId) ?? -1];
}

export function getRoundEntry(teamId: string, roundId: string): RoundEntry | undefined {
  return ROUND_ENTRIES.find((e) => e.teamId === teamId && e.roundId === roundId);
}

export function getEntriesForRound(roundId: string): RoundEntry[] {
  return ROUND_ENTRIES.filter((e) => e.roundId === roundId);
}

/** 所有已喊單標的（去重），供行情 API 使用 */
export function getAllEntrySymbols(): string[] {
  const symbols = new Set<string>();
  for (const entry of ROUND_ENTRIES) {
    for (const leg of entry.main) symbols.add(leg.symbol);
    for (const leg of entry.sprint) symbols.add(leg.symbol);
  }
  return [...symbols];
}

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function parsePrice(v?: string): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function pctFromPrices(entry: number, exit: number, direction: TradeDirection = "long"): number {
  if (entry === 0) return 0;
  return direction === "short" ? ((entry - exit) / entry) * 100 : ((exit - entry) / entry) * 100;
}

/** 主賽單一標的盈虧 %；livePrice 為即時行情（未平倉時使用） */
export function mainLegReturnPct(leg: MainLeg, livePrice?: number): number | undefined {
  if (typeof leg.returnPct === "number") return leg.returnPct;
  const entry = parsePrice(leg.entryPrice);
  const exit = parsePrice(leg.exitPrice) ?? livePrice;
  if (entry == null || exit == null) return undefined;
  return pctFromPrices(entry, exit, leg.direction);
}

/** 副賽單一標的漲跌 %；livePrice 為即時行情 */
export function sprintLegReturnPct(leg: SprintLeg, livePrice?: number): number | undefined {
  if (typeof leg.returnPct === "number") return leg.returnPct;
  const entry = parsePrice(leg.entryPrice);
  const exit = parsePrice(leg.exitPrice) ?? livePrice;
  if (entry == null || exit == null) return undefined;
  return pctFromPrices(entry, exit, "long");
}

export function mainScore(entry: RoundEntry, livePrices?: Record<string, number>): number | undefined {
  const legs = entry.main
    .map((l) => mainLegReturnPct(l, livePrices?.[l.symbol]))
    .filter((v): v is number => typeof v === "number");
  if (legs.length < entry.main.length || legs.length === 0) return undefined;
  return average(legs);
}

export function sprintScore(entry: RoundEntry, livePrices?: Record<string, number>): number | undefined {
  const legs = entry.sprint
    .map((l) => sprintLegReturnPct(l, livePrices?.[l.symbol]))
    .filter((v): v is number => typeof v === "number");
  if (legs.length < entry.sprint.length || legs.length === 0) return undefined;
  return average(legs);
}

export type TeamSeasonStats = {
  team: Team;
  /** 各站積分加總（不含暖身週） */
  points: number;
  roundsPlayed: number;
  /** 各站主賽盈虧 % 加總（不含暖身週） */
  cumulativeMainReturnPct?: number;
  /** 各站副賽漲跌 % 加總（不含暖身週） */
  cumulativeSprintReturnPct?: number;
};

export function getTeamSeasonStats(teamId: string): TeamSeasonStats {
  const team = getTeam(teamId)!;
  const entries = ROUND_ENTRIES.filter((e) => e.teamId === teamId && e.roundId !== "warmup");
  const points = entries.reduce((sum, e) => sum + (e.points ?? 0), 0);
  const mainReturns: number[] = [];
  const sprintReturns: number[] = [];
  for (const e of entries) {
    const m = mainScore(e);
    const s = sprintScore(e);
    if (typeof m === "number") mainReturns.push(m);
    if (typeof s === "number") sprintReturns.push(s);
  }
  return {
    team,
    points,
    roundsPlayed: entries.length,
    cumulativeMainReturnPct:
      mainReturns.length > 0 ? mainReturns.reduce((sum, v) => sum + v, 0) : undefined,
    cumulativeSprintReturnPct:
      sprintReturns.length > 0 ? sprintReturns.reduce((sum, v) => sum + v, 0) : undefined,
  };
}

export function getSeasonStandings(): TeamSeasonStats[] {
  return TEAMS.map((t) => getTeamSeasonStats(t.id)).sort((a, b) => {
    const mainDiff =
      (b.cumulativeMainReturnPct ?? -Infinity) - (a.cumulativeMainReturnPct ?? -Infinity);
    if (mainDiff !== 0) return mainDiff;
    if (b.points !== a.points) return b.points - a.points;
    return 0;
  });
}

export const COMPETITION_PDF = "/aitgp/AITGP-競賽公告-v6.pdf";
