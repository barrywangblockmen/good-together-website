"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { NEWSLETTER_TOPICS, type NewsletterTopicId } from "@/lib/newsletter-topics";

const topicIdEnum = z.enum(
  NEWSLETTER_TOPICS.map((t) => t.id) as [
    NewsletterTopicId,
    NewsletterTopicId,
    NewsletterTopicId,
  ]
);

const formSchema = z
  .object({
    email: z.string().trim().email("請填寫有效 Email"),
    name: z.string().trim(),
    topics: z.array(topicIdEnum),
    consent: z.boolean(),
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.consent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請同意隱私權政策",
        path: ["consent"],
      });
    }
    if (data.topics.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請至少選擇一個主題",
        path: ["topics"],
      });
    }
    const nameTrim = data.name.trim();
    if (nameTrim.length > 80) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "姓名長度不可超過 80 字元",
        path: ["name"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

type NewsletterFormProps = {
  variant?: "default" | "compact";
  idPrefix?: string;
};

function TopicCheckboxes({
  idPrefix,
  selected,
  onChange,
  error,
  compact,
}: {
  idPrefix: string;
  selected: string[];
  onChange: (topics: string[]) => void;
  error?: string;
  compact?: boolean;
}) {
  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, id]);
    } else {
      onChange(selected.filter((t) => t !== id));
    }
  };

  return (
    <fieldset className="space-y-2">
      <legend
        className={`mb-2 block font-medium text-ink ${compact ? "text-sm" : "text-sm"}`}
      >
        訂閱主題 <span className="text-danger">*</span>
      </legend>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {NEWSLETTER_TOPICS.map((topic) => {
          const inputId = `${idPrefix}-topic-${topic.id}`;
          const checked = selected.includes(topic.id);
          return (
            <label
              key={topic.id}
              htmlFor={inputId}
              className={`flex cursor-pointer gap-3 rounded-xl border border-edge bg-page transition has-checked:border-primary/50 has-checked:bg-primary/5 ${compact ? "p-3" : "p-4"}`}
            >
              <input
                id={inputId}
                type="checkbox"
                className="mt-1 size-4 shrink-0 rounded border-edge text-primary focus:ring-ring"
                checked={checked}
                onChange={(e) => toggle(topic.id, e.target.checked)}
              />
              <span className="min-w-0">
                <span className={`block font-medium text-ink ${compact ? "text-sm" : ""}`}>
                  {topic.label}
                </span>
                {!compact ? (
                  <span className="mt-0.5 block text-sm text-muted">{topic.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function NewsletterForm({
  variant = "default",
  idPrefix = "newsletter",
}: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      topics: [],
      consent: false,
      website: "",
    },
  });

  const selectedTopics = watch("topics");

  const onSubmit = handleSubmit(async (values) => {
    setStatus("idle");
    const nameTrim = values.name.trim();
    const body = {
      email: values.email,
      name: nameTrim === "" ? undefined : nameTrim,
      topics: values.topics,
      consent: true as const,
      website: values.website || "",
    };

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 204) {
      setStatus("success");
      reset({ topics: [], consent: false });
      return;
    }

    if (!res.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    reset({ topics: [], consent: false });
  });

  if (status === "success") {
    return (
      <div
        className={
          variant === "compact"
            ? "text-sm text-muted"
            : "rounded-2xl border border-edge bg-surface p-6 text-center shadow-sm md:p-8"
        }
      >
        <p
          className={
            variant === "compact" ? "font-medium text-ink" : "text-lg font-semibold text-ink"
          }
        >
          已成功訂閱
        </p>
        {variant === "default" ? (
          <p className="mt-2 text-sm text-muted">
            感謝你的支持，我們會依你選擇的主題寄送電子報。
          </p>
        ) : null}
      </div>
    );
  }

  const emailId = `${idPrefix}-email`;
  const nameId = `${idPrefix}-name`;
  const consentId = `${idPrefix}-consent`;

  if (variant === "compact") {
    return (
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden
          {...register("website")}
        />
        <p className="text-sm font-semibold text-ink">訂閱電子報</p>
        <p className="text-sm text-muted">選擇想接收的主題，隨時可退訂。</p>
        <TopicCheckboxes
          idPrefix={idPrefix}
          selected={selectedTopics}
          onChange={(topics) => setValue("topics", topics as FormValues["topics"], { shouldValidate: true })}
          error={errors.topics?.message}
          compact
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={emailId}
            type="email"
            placeholder="Email"
            className="min-w-0 flex-1 rounded-xl border border-edge bg-page px-4 py-2.5 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            {...register("email")}
          />
          <Button type="submit" variant="primary" loading={isSubmitting} className="shrink-0">
            訂閱
          </Button>
        </div>
        {errors.email ? (
          <p id={`${emailId}-error`} className="text-sm text-danger" role="alert">
            {errors.email.message}
          </p>
        ) : null}
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            id={consentId}
            type="checkbox"
            className="mt-0.5 size-3.5 rounded border-edge text-primary focus:ring-ring"
            aria-invalid={errors.consent ? true : undefined}
            {...register("consent")}
          />
          <span>
            同意{" "}
            <Link className="text-primary underline-offset-2 hover:underline" href="/privacy">
              隱私權政策
            </Link>
          </span>
        </label>
        {errors.consent ? (
          <p className="text-sm text-danger" role="alert">
            {errors.consent.message}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-danger" role="alert">
            訂閱失敗，請稍後再試。
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-edge bg-surface p-6 shadow-sm md:p-8"
      noValidate
    >
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
        {...register("website")}
      />

      <TopicCheckboxes
        idPrefix={idPrefix}
        selected={selectedTopics}
        onChange={(topics) => setValue("topics", topics as FormValues["topics"], { shouldValidate: true })}
        error={errors.topics?.message}
      />

      <div>
        <label htmlFor={emailId} className="mb-1 block text-sm font-medium text-ink">
          Email <span className="text-danger">*</span>
        </label>
        <input
          id={emailId}
          type="email"
          className="w-full rounded-xl border border-edge bg-page px-4 py-3 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-danger" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={nameId} className="mb-1 block text-sm font-medium text-ink">
          姓名（選填）
        </label>
        <input
          id={nameId}
          className="w-full rounded-xl border border-edge bg-page px-4 py-3 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p id={`${nameId}-error`} className="mt-1 text-sm text-danger" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            id={consentId}
            type="checkbox"
            className="mt-1 size-4 rounded border-edge text-primary focus:ring-ring"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${consentId}-error` : undefined}
            {...register("consent")}
          />
          <span>
            我已閱讀並同意{" "}
            <Link className="text-primary underline-offset-2 hover:underline" href="/privacy">
              隱私權政策
            </Link>
            ，同意協會依我所選主題寄送電子報，並知悉可隨時退訂各主題。
          </span>
        </label>
        {errors.consent ? (
          <p id={`${consentId}-error`} className="mt-1 text-sm text-danger" role="alert">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      {status === "error" ? (
        <p className="text-sm text-danger" role="alert">
          訂閱失敗，請稍後再試，或確認網路連線。
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full md:w-auto">
        訂閱電子報
      </Button>
    </form>
  );
}
