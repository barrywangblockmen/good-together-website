import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page",
  ghost:
    "text-ink hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page",
  outline:
    "border border-edge bg-transparent text-ink hover:border-primary-muted hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page",
};

type Common = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  loading?: boolean;
};

type ButtonProps = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = Common & {
  href: string;
  onClick?: () => void;
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    children,
    className = "",
    variant = "primary",
    loading,
    ...rest
  } = props;
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none";

  if ("href" in props && props.href) {
    const { onClick } = props as LinkButtonProps;
    return (
      <Link
        href={props.href}
        onClick={onClick}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </Link>
    );
  }

  const btn = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={btn.type ?? "button"}
      {...btn}
      aria-busy={loading || undefined}
      disabled={loading || btn.disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
            aria-hidden
          />
          處理中…
        </span>
      ) : (
        children
      )}
    </button>
  );
}
