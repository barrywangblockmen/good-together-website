"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const formSchema = z
  .object({
    email: z.string().trim().email("請填寫有效 Email"),
    name: z.string().trim(),
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

export function NewsletterForm({
  variant = "default",
  idPrefix = "newsletter",
}: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      consent: false,
      website: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("idle");
    const nameTrim = values.name.trim();
    const body = {
      email: values.email,
      name: nameTrim === "" ? undefined : nameTrim,
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
      reset({ consent: false });
      return;
    }

    if (!res.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    reset({ consent: false });
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
        <p className={variant === "compact" ? "font-medium text-ink" : "text-lg font-semibold text-ink"}>
          已成功訂閱電子報
        </p>
        {variant === "default" ? (
          <p className="mt-2 text-sm text-muted">感謝你的支持，我們會將協會動態寄至你的信箱。</p>
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
        <p className="text-sm text-muted">接收協會活動與共好動態，隨時可退訂。</p>
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
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <input
                id={consentId}
                type="checkbox"
                className="mt-0.5 size-3.5 rounded border-edge text-primary focus:ring-ring"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? `${consentId}-error` : undefined}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <span>
            同意{" "}
            <Link className="text-primary underline-offset-2 hover:underline" href="/privacy">
              隱私權政策
            </Link>
          </span>
        </label>
        {errors.consent ? (
          <p id={`${consentId}-error`} className="text-sm text-danger" role="alert">
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
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <input
                id={consentId}
                type="checkbox"
                className="mt-1 size-4 rounded border-edge text-primary focus:ring-ring"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? `${consentId}-error` : undefined}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <span>
            我已閱讀並同意{" "}
            <Link className="text-primary underline-offset-2 hover:underline" href="/privacy">
              隱私權政策
            </Link>
            ，同意協會寄送電子報至我的 Email，並知悉可隨時退訂。
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
