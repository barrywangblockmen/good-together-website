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
  /** 車隊個人網站（外連）；尚未建站則留空 */
  website?: string;
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

/** 賽季終點年度大獎（合計 200 USDT + MacBook Air M1） */
export const ANNUAL_AWARDS: {
  title: string;
  reward: string;
  highlight?: boolean;
}[] = [
  { title: "年度車手冠軍", reward: "MacBook Air M1 + 50 USDT", highlight: true },
  { title: "年度總積分第二名", reward: "50 USDT" },
  { title: "年度總積分第三名", reward: "30 USDT" },
  { title: "年度總積分第四名", reward: "20 USDT" },
  { title: "年度總積分第五名", reward: "10 USDT" },
  { title: "最佳 AI 車隊設計", reward: "20 USDT" },
  { title: "最佳 Review", reward: "20 USDT" },
];

export const ANNUAL_AWARDS_TOTAL = "200 USDT + MacBook Air M1";

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
    "本賽事比的是 1x 曝險下的選股與交易紀律；禁止以選擇權、槓桿型商品等內含槓桿的工具放大報酬率。",
  allowed: [
    "上市／上櫃現股、一般 ETF、反向 ETF（限 1 倍，非槓桿型）",
    "指數期貨（限 1 口標準／小口，不得額外融資或放大的保證金操作）",
    "加密資產（限 1x，合約須關閉槓桿放大）",
  ],
  prohibited: [
    "選擇權（含買權、賣權、週選、月選）",
    "權證、牛熊證、可轉債等具內含槓桿或不對稱損益結構之商品",
    "槓桿型 ETF（2x／3x 等）、結構型商品",
    "任何以少額保證金或權利金承擔超過 1x 曝險之操作（含賣出選擇權）",
  ],
  leverageNote:
    "「1x 槓桿」指單一標的之盈虧 % 應與標的本身價格漲跌幅相當；反向 ETF 可參賽，但不得使用槓桿型 ETF 或額外保證金倍數放大報酬。",
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

/** 主辦方保留調整規則之聲明（顯示於賽制區塊末） */
export const RULES_DISCLAIMER = {
  title: "規則調整聲明",
  body: "本頁賽制說明為 AITGP 2026 賽季之參考版本。GT Club 主辦方得依賽事進行狀況，於賽期內調整、補充或解釋規則（含標的規範、計分方式與爭議處理）。重大變更將於本頁面或每週線上會議公告；參賽者於公告後繼續參賽，視為同意更新後之規則。若有未盡事宜或解釋歧異，以主辦方最終說明為準。",
} as const;

export const POINTS_NOTE =
  "主賽與副賽積分分開計算（每站各依名次給分）；年度排名以主賽 + 副賽總積分合計。";

export const SEASON_LABEL = "2026 賽季";
export const SEASON_KICKOFF = "2026 年 6 月 29 日（建隊週）";

/** 特定站次覆寫賽車圖（GP0 等預設仍用 team.car） */
export const TEAM_ROUND_CAR_OVERRIDES: Record<string, Partial<Record<string, string>>> = {
  "strawberry-berry": {
    r01: "/aitgp/teams/strawberry-berry/car-r01.png",
  },
  "project-d": {
    r01: "/aitgp/teams/project-d/car-r01.png",
  },
  "redrock-racing": {
    r01: "/aitgp/teams/redrock-racing/car-r01.png",
  },
  "princess-yuanying": {
    r01: "/aitgp/teams/princess-yuanying/car-r01.png",
  },
  "money-queue": {
    r01: "/aitgp/teams/money-queue/car-r01.png",
  },
};

/** 特定站次覆寫 Logo（GP0 等預設仍用 team.logo） */
export const TEAM_ROUND_LOGO_OVERRIDES: Record<string, Partial<Record<string, string>>> = {
  "princess-yuanying": {
    r01: "/aitgp/teams/princess-yuanying/logo-r01.png",
  },
};

export function getTeamCarSrc(team: Team, roundId?: string): string | undefined {
  if (roundId) {
    const override = TEAM_ROUND_CAR_OVERRIDES[team.id]?.[roundId];
    if (override) return override;
    // R02–R08 沿用 R01 賽車圖
    if (/^r0[2-8]$/.test(roundId)) {
      const r01Car = TEAM_ROUND_CAR_OVERRIDES[team.id]?.r01;
      if (r01Car) return r01Car;
    }
  }
  return team.car;
}

export function getTeamLogoSrc(team: Team, roundId?: string): string | undefined {
  if (roundId) {
    const override = TEAM_ROUND_LOGO_OVERRIDES[team.id]?.[roundId];
    if (override) return override;
  }
  return team.logo;
}

export const TEAMS: Team[] = [
  {
    id: "strawberry-berry",
    name: "草莓貝瑞車隊",
    driver: "Barry",
    color: "#FF4D6D",
    blurb: "用 AI 整理財報、抓進出場點位，紀律進場、設好目標價再放著。",
    logo: "/aitgp/teams/strawberry-berry/logo.png",
    car: "/aitgp/teams/strawberry-berry/car.png",
    website: "https://strawbarry-racing.barryse.chatgpt.site/",
  },
  {
    id: "project-d",
    name: "Project D車隊",
    driver: "Eli",
    color: "#00D4FF",
    blurb: "PROJECT D — Formula Electric",
    logo: "/aitgp/teams/project-d/logo.png",
    car: "/aitgp/teams/project-d/car.png",
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
    blurb: "ドリフト魂 — RX-7 FD3S",
    logo: "/aitgp/teams/money-queue/logo.png",
    car: "/aitgp/teams/money-queue/car.png",
  },
  {
    id: "one-more-order",
    name: "再凹單就會隊",
    driver: "Sam",
    color: "#C41E3A",
    blurb: "ZADJHD — 再凹一單就會…",
    logo: "/aitgp/teams/one-more-order/logo.png",
    car: "/aitgp/teams/one-more-order/car.png",
  },
  {
    id: "youre-right",
    name: "你說的都隊",
    driver: "Muriel",
    color: "#5B8DEF",
    blurb: "NI SHUO DE DOU TEAM",
    logo: "/aitgp/teams/youre-right/logo.png",
    car: "/aitgp/teams/youre-right/car.png",
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
    settleDate: "7/4（六）08:00 結算",
    status: "settled",
    note: "暖身賽已於 7/4（六）08:00 結算，盈虧鎖定不再更新；純練習、不計入賽季積分。",
  },
  {
    id: "r01",
    code: "R01",
    name: "奧地利站 Austrian GP",
    theme: "Round 01",
    circuit: "Red Bull Ring",
    tradingPeriod: "7/6（一）– 7/17（五）",
    settleDate: "7/20（一）結算",
    status: "settled",
    note: "已於 7/18（六）08:00 結算完成，盈虧鎖定不再更新。",
  },
  {
    id: "r02",
    code: "R02",
    name: "匈牙利站 Hungarian GP",
    theme: "Round 02",
    circuit: "Hungaroring",
    tradingPeriod: "7/27（一）– 8/7（五）",
    settleDate: "8/10（一）結算",
    status: "settled",
    note: "已結算完成：台股以 7/31 13:30 收盤價鎖定；加密／美股代幣以 8/1 04:00（美股收盤後）鎖定，盈虧不再更新。",
  },
  {
    id: "r03",
    code: "R03",
    name: "荷蘭站 Dutch GP",
    theme: "Round 03",
    circuit: "Zandvoort",
    tradingPeriod: "8/10（一）– 8/21（五）",
    settleDate: "8/24（一）結算",
    status: "settled",
    note: "已結算完成：台股以 8/21（五）13:30 收盤價鎖定；美股代幣以 8/22 04:00 鎖定；加密以 8/22 08:00 鎖定（已提前平倉者沿用平倉價），盈虧不再更新。",
  },
  {
    id: "r04",
    code: "R04",
    name: "西班牙站 Spanish GP",
    theme: "Round 04 · 馬德里",
    circuit: "Madring",
    tradingPeriod: "8/31（一）– 9/11（五）",
    settleDate: "9/14（一）結算",
    status: "upcoming",
  },
  {
    id: "r05",
    code: "R05",
    name: "新加坡站 Singapore GP",
    theme: "Round 05",
    circuit: "Marina Bay",
    tradingPeriod: "9/21（一）– 10/2（五）",
    settleDate: "10/5（一）結算",
    status: "upcoming",
  },
  {
    id: "r06",
    code: "R06",
    name: "美國站 United States GP",
    theme: "Round 06",
    circuit: "COTA, Austin",
    tradingPeriod: "10/12（一）– 10/23（五）",
    settleDate: "10/26（一）結算",
    status: "upcoming",
  },
  {
    id: "r07",
    code: "R07",
    name: "拉斯維加斯站 Las Vegas GP",
    theme: "Round 07",
    circuit: "Las Vegas Strip",
    tradingPeriod: "11/2（一）– 11/13（五）",
    settleDate: "11/16（一）結算",
    status: "upcoming",
  },
  {
    id: "r08",
    code: "R08",
    name: "阿布達比站 Abu Dhabi GP",
    theme: "Round 08 · 年度收官",
    circuit: "Yas Marina",
    tradingPeriod: "11/23（一）– 12/4（五）",
    settleDate: "12/7（一）總結算 + 年度頒獎",
    status: "upcoming",
  },
];

const AITGP_SEASON_YEAR = 2026;

/** 解析賽期字串（例 7/6（一）– 7/17（五））為台北時間起迄日 */
export function parseRoundTradingDates(
  tradingPeriod: string,
  year = AITGP_SEASON_YEAR,
): { start: Date; end: Date } | null {
  const m = tradingPeriod.match(/(\d{1,2})\/(\d{1,2}).*?[–-]\s*(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = new Date(
    `${year}-${pad(Number(m[1]))}-${pad(Number(m[2]))}T00:00:00+08:00`,
  );
  const end = new Date(
    `${year}-${pad(Number(m[3]))}-${pad(Number(m[4]))}T23:59:59.999+08:00`,
  );
  return { start, end };
}

function taipeiStartOfDay(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "01";
  return new Date(`${get("year")}-${get("month")}-${get("day")}T00:00:00+08:00`);
}

/** 依台北日期決定預設站次（賽期內 → 該站；空檔 → 下一站；已結束 → 最近一站） */
export function getDefaultRoundId(now = new Date()): string {
  const today = taipeiStartOfDay(now);

  for (const round of ROUNDS) {
    const range = parseRoundTradingDates(round.tradingPeriod);
    if (!range) continue;
    if (today >= range.start && today <= range.end) return round.id;
  }

  let next: { id: string; start: Date } | null = null;
  for (const round of ROUNDS) {
    const range = parseRoundTradingDates(round.tradingPeriod);
    if (!range || range.start <= today) continue;
    if (!next || range.start < next.start) next = { id: round.id, start: range.start };
  }
  if (next) return next.id;

  for (let i = ROUNDS.length - 1; i >= 0; i--) {
    const range = parseRoundTradingDates(ROUNDS[i].tradingPeriod);
    if (range && today > range.end) return ROUNDS[i].id;
  }

  return ROUNDS[0]?.id ?? "warmup";
}

// 各站、各隊成績。GP0 已於 7/4 08:00 結算（exitPrice 鎖定）；正式站次開跑後手動填入。
export const ROUND_ENTRIES: RoundEntry[] = [
  {
    teamId: "project-d",
    roundId: "warmup",
    main: [
      { symbol: "AAVE", direction: "long", entryPrice: "91.5", exitPrice: "87.56" },
      { symbol: "2409", label: "友達", direction: "long", entryPrice: "30.6", exitPrice: "30.00" },
    ],
    sprint: [
      { symbol: "AAVE", entryPrice: "91.5", exitPrice: "87.56" },
      { symbol: "2409", label: "友達", entryPrice: "30.6", exitPrice: "30.00" },
    ],
  },
  {
    teamId: "money-queue",
    roundId: "warmup",
    main: [
      { symbol: "2603", label: "長榮", direction: "long", entryPrice: "182.5", exitPrice: "195.00" },
      { symbol: "2356", label: "英業達", direction: "long", entryPrice: "64.2", exitPrice: "67.60" },
    ],
    sprint: [
      { symbol: "2603", label: "長榮", entryPrice: "182.5", exitPrice: "195.00" },
      { symbol: "2356", label: "英業達", entryPrice: "64.2", exitPrice: "67.60" },
    ],
  },
  {
    teamId: "strawberry-berry",
    roundId: "warmup",
    main: [
      { symbol: "PUMP", direction: "long", entryPrice: "0.001447", exitPrice: "0.001629" },
      { symbol: "HYPE", direction: "long", entryPrice: "62.714", exitPrice: "70.71" },
    ],
    sprint: [
      { symbol: "XAUT", entryPrice: "4061.6", exitPrice: "4161.34" },
      { symbol: "MUUSDT", entryPrice: "1155.58", exitPrice: "1027.57" },
    ],
  },
  {
    teamId: "princess-yuanying",
    roundId: "warmup",
    main: [
      { symbol: "2337", label: "旺宏", direction: "long", entryPrice: "166", exitPrice: "142.50" },
      { symbol: "3189", label: "景碩", direction: "long", entryPrice: "794", exitPrice: "833.00" },
    ],
    sprint: [
      { symbol: "2337", label: "旺宏", entryPrice: "166", exitPrice: "142.50" },
      { symbol: "3189", label: "景碩", entryPrice: "794", exitPrice: "833.00" },
    ],
  },
  {
    teamId: "redrock-racing",
    roundId: "warmup",
    main: [
      { symbol: "8255", label: "朋程", direction: "long", entryPrice: "176.50", exitPrice: "186.50" },
      { symbol: "SPCX", direction: "long", entryPrice: "155.34", exitPrice: "158.90" },
    ],
    sprint: [
      { symbol: "2059", label: "川湖", entryPrice: "7110", exitPrice: "8000" },
      { symbol: "5536", label: "聖暉", entryPrice: "1245", exitPrice: "1430" },
    ],
  },
  {
    teamId: "one-more-order",
    roundId: "warmup",
    main: [
      {
        symbol: "MTX",
        label: "小台指期",
        direction: "long",
        entryPrice: "45558",
        exitPrice: "46888",
        taifexContract: "202607",
      },
      { symbol: "07w1 44500P", label: "小台 Put", direction: "short", entryPrice: "255", exitPrice: "0.2" },
    ],
    sprint: [
      {
        symbol: "MTX",
        label: "小台指",
        entryPrice: "45558",
        exitPrice: "46888",
        taifexContract: "202607",
      },
      { symbol: "2408", label: "南亞科", entryPrice: "453", exitPrice: "409.50" },
    ],
  },
  {
    teamId: "youre-right",
    roundId: "warmup",
    main: [
      { symbol: "2330", label: "台積電", direction: "long", entryPrice: "2330", exitPrice: "2445" },
      { symbol: "2308", label: "台達電", direction: "long", entryPrice: "1860", exitPrice: "2075" },
    ],
    sprint: [
      { symbol: "2330", label: "台積電", entryPrice: "2330", exitPrice: "2445" },
      { symbol: "2308", label: "台達電", entryPrice: "1860", exitPrice: "2075" },
    ],
  },
  {
    teamId: "guinea-pig",
    roundId: "warmup",
    main: [
      { symbol: "3481", label: "群創", direction: "long", entryPrice: "67", exitPrice: "66.00" },
      { symbol: "6669", label: "緯穎", direction: "long", entryPrice: "4335", exitPrice: "5265" },
    ],
    sprint: [
      { symbol: "3481", label: "群創", entryPrice: "67", exitPrice: "66.00" },
      { symbol: "6669", label: "緯穎", entryPrice: "4335", exitPrice: "5265" },
    ],
  },
  // R01 奧地利站（7/6–7/17）
  {
    teamId: "princess-yuanying",
    roundId: "r01",
    main: [
      { symbol: "3037", label: "欣興", direction: "long", entryPrice: "913", exitPrice: "794" },
      { symbol: "3711", label: "日月光", direction: "long", entryPrice: "682", exitPrice: "614" },
    ],
    sprint: [
      { symbol: "8027", label: "鈦昇", entryPrice: "254", exitPrice: "215.5" },
      { symbol: "2337", label: "旺宏", entryPrice: "146.5", exitPrice: "125" },
    ],
    points: 20,
  },
  {
    teamId: "one-more-order",
    roundId: "r01",
    main: [
      { symbol: "DOGE", direction: "short", entryPrice: "0.07764", exitPrice: "0.07227" },
      { symbol: "PEPE", direction: "short", entryPrice: "0.000002753", exitPrice: "0.000002599" },
    ],
    sprint: [
      { symbol: "2330", label: "台積電", entryPrice: "2465", exitPrice: "2290" },
      { symbol: "2408", label: "南亞科", entryPrice: "428", exitPrice: "395.5" },
    ],
    points: 40,
  },
  {
    teamId: "money-queue",
    roundId: "r01",
    main: [
      { symbol: "4991", label: "環宇-KY", direction: "long", entryPrice: "548", exitPrice: "360" },
      { symbol: "8271", label: "宇瞻", direction: "long", entryPrice: "196", exitPrice: "190" },
    ],
    sprint: [
      { symbol: "4991", label: "環宇-KY", entryPrice: "548", exitPrice: "360" },
      { symbol: "8271", label: "宇瞻", entryPrice: "196", exitPrice: "190" },
    ],
    points: 10,
  },
  {
    teamId: "project-d",
    roundId: "r01",
    main: [
      { symbol: "AAVE", direction: "long", entryPrice: "88.64", exitPrice: "89.68" },
      { symbol: "NEAR", direction: "long", entryPrice: "2.005", exitPrice: "1.922" },
    ],
    sprint: [
      { symbol: "2409", label: "友達", entryPrice: "30.4", exitPrice: "25.8" },
      { symbol: "AAVE", entryPrice: "88.64", exitPrice: "89.68" },
    ],
    points: 36,
  },
  {
    teamId: "redrock-racing",
    roundId: "r01",
    main: [
      { symbol: "8255", label: "朋程", direction: "long", entryPrice: "200", exitPrice: "150.5" },
      { symbol: "5536", label: "聖暉", direction: "long", entryPrice: "1435", exitPrice: "1140" },
    ],
    sprint: [
      { symbol: "2059", label: "川湖", entryPrice: "8000", exitPrice: "7890" },
      { symbol: "SPCX", entryPrice: "165.95", exitPrice: "123.95" },
    ],
    points: 14,
  },
  {
    teamId: "guinea-pig",
    roundId: "r01",
    main: [
      { symbol: "6669", label: "緯穎", direction: "long", entryPrice: "5325", exitPrice: "4620" },
      { symbol: "2330", label: "台積電", direction: "long", entryPrice: "2465", exitPrice: "2290" },
    ],
    sprint: [
      { symbol: "2382", label: "廣達", entryPrice: "377", exitPrice: "325.5" },
      { symbol: "3037", label: "欣興", entryPrice: "898", exitPrice: "794" },
    ],
    points: 27,
  },
  {
    teamId: "strawberry-berry",
    roundId: "r01",
    main: [
      { symbol: "HYPE", direction: "long", entryPrice: "72.195", exitPrice: "59.742" },
      { symbol: "LIT", direction: "long", entryPrice: "2.5399", exitPrice: "2.2925" },
    ],
    sprint: [
      { symbol: "ONDO", entryPrice: "0.3296", exitPrice: "0.3734" },
      { symbol: "UNI", entryPrice: "3.171", exitPrice: "3.616" },
    ],
    points: 35,
  },
  {
    teamId: "youre-right",
    roundId: "r01",
    main: [
      { symbol: "2308", label: "台達電", direction: "long", entryPrice: "2120", exitPrice: "1740" },
      { symbol: "6620", label: "漢達", direction: "long", entryPrice: "104", exitPrice: "86.5" },
    ],
    sprint: [
      { symbol: "2308", label: "台達電", entryPrice: "2120", exitPrice: "1740" },
      { symbol: "6620", label: "漢達", entryPrice: "104", exitPrice: "86.5" },
    ],
    points: 14,
  },
  // R02 匈牙利站（7/27–8/7）；已結算
  {
    teamId: "strawberry-berry",
    roundId: "r02",
    main: [
      { symbol: "XAG", direction: "short", entryPrice: "57.79", exitPrice: "58.02" },
      { symbol: "LIT", direction: "long", entryPrice: "2.2117", exitPrice: "2.0672" },
    ],
    sprint: [
      { symbol: "ONDO", entryPrice: "0.3455", exitPrice: "0.3963" },
      { symbol: "UNI", entryPrice: "3.519", exitPrice: "4.231" },
    ],
    points: 35,
  },
  {
    teamId: "money-queue",
    roundId: "r02",
    main: [
      { symbol: "4991", label: "環宇-KY", direction: "long", entryPrice: "346", exitPrice: "353" },
      { symbol: "3231", label: "緯創", direction: "long", entryPrice: "142", exitPrice: "176" },
    ],
    sprint: [
      { symbol: "4991", label: "環宇-KY", entryPrice: "346", exitPrice: "353" },
      { symbol: "3231", label: "緯創", entryPrice: "142", exitPrice: "176" },
    ],
    points: 43,
  },
  {
    teamId: "youre-right",
    roundId: "r02",
    main: [
      { symbol: "2330", label: "台積電", direction: "long", entryPrice: "2300", exitPrice: "2425" },
      { symbol: "2303", label: "聯電", direction: "long", entryPrice: "141", exitPrice: "121" },
    ],
    sprint: [
      { symbol: "2330", label: "台積電", entryPrice: "2300", exitPrice: "2425" },
      { symbol: "2303", label: "聯電", entryPrice: "141", exitPrice: "121" },
    ],
    points: 18,
  },
  {
    teamId: "princess-yuanying",
    roundId: "r02",
    main: [
      { symbol: "2313", label: "華通", direction: "long", entryPrice: "205", exitPrice: "169" },
      { symbol: "3189", label: "景碩", direction: "long", entryPrice: "694", exitPrice: "635" },
    ],
    sprint: [
      { symbol: "2454", label: "聯發科", entryPrice: "3355", exitPrice: "3555" },
      { symbol: "3189", label: "景碩", entryPrice: "694", exitPrice: "635" },
    ],
    points: 19,
  },
  {
    teamId: "redrock-racing",
    roundId: "r02",
    main: [
      { symbol: "BTC", direction: "long", entryPrice: "64750", exitPrice: "62933.3" },
      { symbol: "2327", label: "國巨", direction: "long", entryPrice: "630", exitPrice: "502" },
    ],
    sprint: [
      { symbol: "SPCX", entryPrice: "123.99", exitPrice: "108.5" },
      { symbol: "5536", label: "聖暉", entryPrice: "1140", exitPrice: "925" },
    ],
    points: 10,
  },
  {
    teamId: "project-d",
    roundId: "r02",
    main: [
      { symbol: "2308", label: "台達電", direction: "long", entryPrice: "1720", exitPrice: "1640" },
      { symbol: "AAVE", direction: "long", entryPrice: "89.71", exitPrice: "96.14" },
    ],
    sprint: [
      { symbol: "NEAR", entryPrice: "1.93", exitPrice: "1.688" },
      { symbol: "AAVE", entryPrice: "89.71", exitPrice: "96.14" },
    ],
    points: 24,
  },
  {
    teamId: "one-more-order",
    roundId: "r02",
    main: [
      { symbol: "MUUSDT", direction: "short", entryPrice: "860.88", exitPrice: "824.42" },
      { symbol: "00632R", label: "0050反一", direction: "long", entryPrice: "10.47", exitPrice: "10.44" },
    ],
    sprint: [
      { symbol: "3374", label: "精材", entryPrice: "349.5", exitPrice: "277" },
      { symbol: "2408", label: "南亞科", entryPrice: "396", exitPrice: "360.5" },
    ],
    points: 21,
  },
  {
    teamId: "guinea-pig",
    roundId: "r02",
    main: [
      { symbol: "6669", label: "緯穎", direction: "long", entryPrice: "4725", exitPrice: "5390" },
      { symbol: "2330", label: "台積電", direction: "long", entryPrice: "2300", exitPrice: "2425" },
    ],
    sprint: [
      { symbol: "2382", label: "廣達", entryPrice: "331.5", exitPrice: "291.5" },
      { symbol: "3037", label: "欣興", entryPrice: "778", exitPrice: "787" },
    ],
    points: 26,
  },
  // R03 荷蘭站（8/10–8/21）；已結算
  {
    teamId: "strawberry-berry",
    roundId: "r03",
    main: [
      { symbol: "SUI", direction: "long", entryPrice: "0.6908", exitPrice: "0.7386" },
      { symbol: "HYPE", direction: "long", entryPrice: "54.12", exitPrice: "72.52" },
    ],
    sprint: [
      { symbol: "ONDO", entryPrice: "0.3480", exitPrice: "0.3971" },
      { symbol: "UNI", entryPrice: "4.051", exitPrice: "4.134" },
    ],
    points: 28,
  },
  {
    teamId: "redrock-racing",
    roundId: "r03",
    main: [
      { symbol: "SPCX", direction: "long", entryPrice: "134.96", exitPrice: "136.9" },
      { symbol: "2059", label: "川湖", direction: "long", entryPrice: "12220", exitPrice: "13385" },
    ],
    sprint: [
      { symbol: "BTC", entryPrice: "64890", exitPrice: "78309.1" },
      { symbol: "2327", label: "國巨", entryPrice: "558", exitPrice: "554" },
    ],
    points: 24,
  },
  {
    teamId: "guinea-pig",
    roundId: "r03",
    main: [
      { symbol: "2454", label: "聯發科", direction: "long", entryPrice: "3920", exitPrice: "3790" },
      { symbol: "2330", label: "台積電", direction: "long", entryPrice: "2390", exitPrice: "2410" },
    ],
    sprint: [
      { symbol: "2454", label: "聯發科", entryPrice: "3920", exitPrice: "3790" },
      { symbol: "2330", label: "台積電", entryPrice: "2390", exitPrice: "2410" },
    ],
    points: 12,
  },
  {
    teamId: "money-queue",
    roundId: "r03",
    main: [
      { symbol: "2337", label: "旺宏", direction: "long", entryPrice: "124", exitPrice: "122.5" },
      { symbol: "4991", label: "環宇-KY", direction: "long", entryPrice: "490", exitPrice: "481" },
    ],
    sprint: [
      { symbol: "2337", label: "旺宏", entryPrice: "124", exitPrice: "122.5" },
      { symbol: "DOGE", entryPrice: "0.06930", exitPrice: "0.09156" },
    ],
    points: 19,
  },
  {
    teamId: "one-more-order",
    roundId: "r03",
    main: [
      { symbol: "2301", label: "光寶科", direction: "long", entryPrice: "271.5", exitPrice: "261" },
      { symbol: "2637", label: "慧洋-KY", direction: "long", entryPrice: "87", exitPrice: "102" },
    ],
    sprint: [
      { symbol: "PEPE", entryPrice: "0.000002890", exitPrice: "0.0000041215" },
      { symbol: "3374", label: "精材", entryPrice: "325", exitPrice: "306.5" },
    ],
    points: 40,
  },
  {
    teamId: "youre-right",
    roundId: "r03",
    main: [
      { symbol: "2308", label: "台達電", direction: "long", entryPrice: "1695", exitPrice: "1750" },
      { symbol: "2303", label: "聯電", direction: "long", entryPrice: "117", exitPrice: "116.5" },
    ],
    sprint: [
      { symbol: "2308", label: "台達電", entryPrice: "1695", exitPrice: "1750" },
      { symbol: "2303", label: "聯電", entryPrice: "117", exitPrice: "116.5" },
    ],
    points: 18,
  },
  {
    teamId: "project-d",
    roundId: "r03",
    main: [
      { symbol: "AAVE", direction: "long", entryPrice: "90.61", exitPrice: "122.79" },
      { symbol: "H", direction: "long", entryPrice: "0.08389", exitPrice: "0.13223" },
    ],
    sprint: [
      { symbol: "AAVE", entryPrice: "90.61", exitPrice: "122.79" },
      { symbol: "2409", label: "友達", entryPrice: "25.6", exitPrice: "25.6" },
    ],
    points: 43,
  },
  {
    teamId: "princess-yuanying",
    roundId: "r03",
    main: [
      { symbol: "2344", label: "華邦電", direction: "long", entryPrice: "176.5", exitPrice: "181" },
      { symbol: "3189", label: "景碩", direction: "long", entryPrice: "820", exitPrice: "811" },
    ],
    sprint: [
      { symbol: "5274", label: "信驊", entryPrice: "16300", exitPrice: "15350" },
      { symbol: "3189", label: "景碩", entryPrice: "820", exitPrice: "811" },
    ],
    points: 12,
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

/** 台股／ETF 代號（走 TWSE）；其餘視為加密／海外合約（走 Binance） */
export function isTwStockSymbol(symbol: string): boolean {
  return /^\d{4}$/.test(symbol) || /^00[\dA-Z]{4}$/i.test(symbol);
}

/** 將結算檔中的 exitPrice 套到尚未平倉的標的上 */
export function applySettledExits(
  entry: RoundEntry,
  exits?: Record<string, string>,
): RoundEntry {
  if (!exits) return entry;
  const apply = <T extends { symbol: string; exitPrice?: string }>(leg: T): T => {
    if (leg.exitPrice != null && leg.exitPrice !== "") return leg;
    const exit = exits[leg.symbol];
    if (exit == null || exit === "") return leg;
    return { ...leg, exitPrice: exit };
  };
  return {
    ...entry,
    main: entry.main.map(apply),
    sprint: entry.sprint.map(apply),
  };
}

export function formatSettlePrice(price: number): string {
  if (!Number.isFinite(price)) return String(price);
  if (price >= 100) return String(Number(price.toFixed(2)));
  if (price >= 1) return String(Number(price.toFixed(4)));
  return String(Number(price.toPrecision(6)));
}

/** 所有已喊單標的（去重），供行情 API 使用 */
export function getAllEntrySymbols(): string[] {
  const symbols = new Set<string>();
  for (const entry of ROUND_ENTRIES) {
    for (const leg of entry.main) symbols.add(leg.symbol);
    for (const leg of entry.sprint) symbols.add(leg.symbol);
  }
  // GT投研目標價榜共用這套行情服務；ETH 尚未出現在 AITGP 喊單中，需額外追蹤。
  symbols.add("ETH");
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

export function getTeamSeasonStats(
  teamId: string,
  settledExitsByRound?: Record<string, Record<string, string>>,
): TeamSeasonStats {
  const team = getTeam(teamId)!;
  const entries = ROUND_ENTRIES.filter((e) => e.teamId === teamId && e.roundId !== "warmup");
  const points = entries.reduce((sum, e) => sum + (e.points ?? 0), 0);
  const mainReturns: number[] = [];
  const sprintReturns: number[] = [];
  for (const e of entries) {
    const resolved = applySettledExits(e, settledExitsByRound?.[e.roundId]);
    const m = mainScore(resolved);
    const s = sprintScore(resolved);
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
    if (b.points !== a.points) return b.points - a.points;
    const mainDiff =
      (b.cumulativeMainReturnPct ?? -Infinity) - (a.cumulativeMainReturnPct ?? -Infinity);
    if (mainDiff !== 0) return mainDiff;
    return 0;
  });
}

export const COMPETITION_PDF = "/aitgp/AITGP-競賽公告-v6.pdf";
