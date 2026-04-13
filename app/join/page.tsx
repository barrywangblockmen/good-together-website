import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "加入我們",
  description:
    "留下加入意向與聯絡方式，台灣共好交流協會將於數個工作天內以 Email 回覆，與你聊聊下一步。",
  path: "/join",
});

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Join"
          title="加入意向表單"
          description="若你認同共好與跨域學習，邀請你留下簡短資料。本站不公開個別聯絡窗口，所有回覆皆由協會以 Email 進行。"
        />
      </Reveal>
      <div className="mt-10">
        <Reveal delay={0.06}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
