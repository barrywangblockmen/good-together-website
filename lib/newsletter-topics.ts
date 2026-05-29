export const NEWSLETTER_TOPICS = [
  {
    id: "btc-daily",
    label: "BTC 日報",
    description: "每日比特幣市場與趨勢摘要。",
  },
  {
    id: "activity-monthly",
    label: "每月活動精彩回顧",
    description: "協會近期活動照片與重點整理。",
  },
  {
    id: "course-monthly",
    label: "每月課程回顧",
    description: "主題課程與學習重點回顧。",
  },
] as const;

export type NewsletterTopicId = (typeof NEWSLETTER_TOPICS)[number]["id"];

const TOPIC_IDS = new Set<string>(NEWSLETTER_TOPICS.map((t) => t.id));

export function isNewsletterTopicId(value: string): value is NewsletterTopicId {
  return TOPIC_IDS.has(value);
}

export function getNewsletterTopic(id: NewsletterTopicId) {
  return NEWSLETTER_TOPICS.find((t) => t.id === id);
}

export function getNewsletterTopicLabel(id: NewsletterTopicId) {
  return getNewsletterTopic(id)?.label ?? id;
}
