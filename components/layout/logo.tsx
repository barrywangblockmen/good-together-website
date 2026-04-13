import Image from "next/image";
import Link from "next/link";

export function LogoLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-semibold text-ink ${className}`}
    >
      <span className="relative block size-10 shrink-0">
        <Image
          src="/logo.svg"
          alt=""
          width={40}
          height={40}
          priority
          unoptimized
          className="absolute inset-0 size-10 transition-opacity dark:opacity-0"
        />
        <Image
          src="/logo-dark.svg"
          alt=""
          width={40}
          height={40}
          priority
          unoptimized
          className="absolute inset-0 size-10 opacity-0 transition-opacity dark:opacity-100"
        />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-xs font-medium text-muted">GT 俱樂部</span>
        <span className="block text-sm">台灣共好交流協會</span>
      </span>
    </Link>
  );
}
