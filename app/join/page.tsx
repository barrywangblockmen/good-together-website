import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { GoalAchieved } from "@/components/join/supporter-count";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "加入協會",
  description:
    "填寫加入協會申請並留下聯絡方式，台灣共好交流協會將於數個工作天內以 Email 回覆，與你聊聊下一步。",
  path: "/join",
});

export default function JoinPage() {
  const steps = [
    "填寫意向表",
    "專人與您聯絡",
    "繳交身分證影本及簽名",
    "成為 GT 夥伴",
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Join"
          title="加入協會"
          description="若你認同共好與跨域學習，邀請你留下資料申請加入協會。本站不公開個別聯絡窗口，所有回覆皆由協會以 Email 進行。"
        />
      </Reveal>
      <Reveal delay={0.04}>
        <div className="mt-8 space-y-6 rounded-2xl border border-edge bg-surface p-6 shadow-sm md:p-8">
          <div className="goal-achieved-card flex min-h-[156px] flex-col justify-center rounded-xl border border-amber-400/40 bg-page p-5 text-center">
            <GoalAchieved />
            <p className="mt-1 text-xs text-muted">感謝每一位支持者</p>
          </div>

          <div className="rounded-xl border border-edge bg-page px-4 py-5 md:px-6">
            <p className="text-center text-sm leading-relaxed text-muted">
              創始連署已達標，人民團體籌備申請已送出。若你有意加入協會，歡迎依下列步驟填寫意向表；正式入會條件尚在規劃，我們將於聯繫時為你說明。
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
              {steps.map((label, idx) => (
                <div key={label} className="relative text-center">
                  {idx < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-4 ml-4 h-px w-[calc(100%-2rem)] bg-edge"
                    />
                  ) : null}
                  <div
                    className={`mx-auto flex size-8 items-center justify-center rounded-full border border-primary/50 bg-surface text-xs font-semibold text-primary ${idx === 0 ? "join-step-first-glow" : ""}`}
                  >
                    {idx + 1}
                  </div>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-ink md:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
      <div className="mt-10">
        <Reveal delay={0.06}>
          <ContactForm />
        </Reveal>
      </div>
      <div className="mt-10">
        <Reveal delay={0.07}>
          <SectionHeading
            eyebrow="Newsletter"
            title="訂閱電子報"
            description="若你尚未準備加入協會，也歡迎先訂閱電子報，接收活動消息與共好動態。"
          />
        </Reveal>
        <div className="mt-6">
          <Reveal delay={0.08}>
            <NewsletterForm idPrefix="join-newsletter" />
          </Reveal>
        </div>
      </div>
      <Reveal delay={0.09}>
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary">身分證資料蒐集說明</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            依《人民團體法》與主管機關會務規範，人民團體需建立與審定會員資格名冊，且會員入會文件通常包含身分證統一編號等身分識別資料，
            以供會務管理、資格查核與依法備查使用。我們僅在上述必要範圍內蒐集與處理，並依個資規範妥善保存。
          </p>
        </div>
      </Reveal>
    </div>
  );
}
