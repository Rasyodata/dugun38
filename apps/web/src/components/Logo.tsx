import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-1.5 font-bold text-xl ${className}`}>
      <span className="text-ink">Düğün</span>
      <span className="inline-flex items-center justify-center rounded-md bg-brand-600 text-white px-1.5 leading-tight">
        38
      </span>
    </Link>
  );
}
