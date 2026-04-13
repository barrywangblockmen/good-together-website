"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const formSchema = z
  .object({
    name: z.string().trim().min(1, "請填寫姓名").max(80),
    email: z.string().trim().email("請填寫有效 Email"),
    phone: z.string().trim(),
    message: z
      .string()
      .trim()
      .min(10, "請至少填寫 10 字")
      .max(2000, "最多 2000 字"),
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
    const p = data.phone.trim();
    if (p.length === 0) return;
    if (p.length < 8 || p.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "電話長度須為 8～20 字元",
        path: ["phone"],
      });
    }
  });

export type ContactFormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("idle");
    const phoneTrim = values.phone.trim();
    const body = {
      name: values.name,
      email: values.email,
      phone: phoneTrim === "" ? undefined : phoneTrim,
      message: values.message,
      consent: true as const,
      website: values.website || "",
    };

    const res = await fetch("/api/contact", {
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
      <div className="rounded-2xl border border-edge bg-surface p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-ink">已收到您的資料</p>
        <p className="mt-2 text-sm text-muted">
          感謝您的意向，我們將於數個工作天內以 Email 與您聯繫。
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => {
            setStatus("idle");
            reset({
              name: "",
              email: "",
              phone: "",
              message: "",
              consent: false,
              website: "",
            });
          }}
        >
          再填一筆
        </Button>
      </div>
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
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
          姓名 <span className="text-danger">*</span>
        </label>
        <input
          id="name"
          className="w-full rounded-xl border border-edge bg-page px-4 py-3 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p id="name-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email <span className="text-danger">*</span>
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-xl border border-edge bg-page px-4 py-3 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p id="email-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
          電話（選填）
        </label>
        <input
          id="phone"
          type="tel"
          className="w-full rounded-xl border border-edge bg-page px-4 py-3 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone ? (
          <p id="phone-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          意願說明 <span className="text-danger">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full rounded-xl border border-edge bg-page px-4 py-3 text-sm text-ink outline-none ring-ring/40 transition focus:border-primary focus:ring-2"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        {errors.message ? (
          <p id="message-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.message.message}
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
                type="checkbox"
                className="mt-1 size-4 rounded border-edge text-primary focus:ring-ring"
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <span>
            我已閱讀並同意{" "}
            <a className="text-primary underline-offset-2 hover:underline" href="/privacy">
              隱私權政策
            </a>
            ，同意協會依政策內容處理我的資料。
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" className="mt-1 text-sm text-danger" role="alert">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      {status === "error" ? (
        <p className="text-sm text-danger" role="alert">
          送出失敗，請稍後再試，或確認網路連線。
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full md:w-auto">
        送出意向
      </Button>
    </form>
  );
}
