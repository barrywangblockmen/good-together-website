import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "已退訂電子報",
  description: "您已成功退訂台灣共好交流協會電子報。",
  path: "/newsletter/unsubscribed",
});

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Newsletter"
          title="已退訂電子報"
          description="您已成功退訂，之後將不再收到協會電子報。若這是誤操作，歡迎隨時重新訂閱。"
        />
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/" variant="primary">
            回到首頁
          </Button>
          <Button href="/join" variant="outline">
            重新訂閱
          </Button>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-6 text-sm text-muted">
          若有其他問題，請透過{" "}
          <Link className="text-primary underline-offset-2 hover:underline" href="/join">
            加入意向表單
          </Link>{" "}
          與我們聯繫。
        </p>
      </Reveal>
    </div>
  );
}
