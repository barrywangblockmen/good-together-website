import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "隱私權政策",
  description:
    "說明台灣共好交流協會網站如何處理造訪紀錄與表單資料，以及你的權利與聯繫方式。",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Legal"
          title="隱私權政策"
          description="本政策說明我們在您使用本網站時，如何蒐集、處理與利用個人資料。若您不同意，請停止使用本網站之表單與互動功能。"
        />
      </Reveal>

      <div className="mt-12 max-w-none space-y-8 text-muted">
        <Reveal delay={0.05}>
          <section>
            <h3 className="text-lg font-semibold text-ink">一、資料蒐集來源</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
              <li>
                <strong className="text-ink">加入意向表單</strong>
                ：您主動填寫的姓名、Email、電話（選填）與意願說明。
              </li>
              <li>
                <strong className="text-ink">網站造訪通知</strong>
                ：為資安維護與服務品質優化（含流量統計分析）之目的，系統可能記錄頁面路徑、來源網址、
                瀏覽器類型、時間戳與來源 IP 等必要技術資料。
              </li>
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section>
            <h3 className="text-lg font-semibold text-ink">二、利用目的</h3>
            <p className="mt-2 leading-relaxed">
              表單資料僅作為聯繫、回覆與內部行政作業；造訪紀錄作為資安與流量分析用途。不會於公開頁面展示您的個人資料。
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.11}>
          <section>
            <h3 className="text-lg font-semibold text-ink">三、保存期間與第三方</h3>
            <p className="mt-2 leading-relaxed">
              資料可能透過電子郵件服務商（例如 Resend）寄送至協會指定信箱，並受該服務商政策與紀錄機制約束。若未另行建檔，本網站第一版不建置會員資料庫；實際保存以協會內部作業為準。
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.14}>
          <section>
            <h3 className="text-lg font-semibold text-ink">四、您的權利</h3>
            <p className="mt-2 leading-relaxed">
              依個人資料保護法等相關法令，您得就個人資料行使查詢、閱覽、製給複製本、補充或更正、停止蒐集處理利用或刪除等權利。若需行使，請透過本網站表單與我們聯繫。
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.17}>
          <section>
            <h3 className="text-lg font-semibold text-ink">五、政策修訂</h3>
            <p className="mt-2 leading-relaxed">
              本政策可能隨網站功能調整而更新，修訂後將公告於本頁並以更新日期標示。
            </p>
            <p className="mt-4 text-sm text-muted">最近更新：2026 年 4 月</p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
