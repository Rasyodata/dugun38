import Link from "next/link";

export function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-xl ${tone === "light" ? "bg-white/10" : "bg-brand-50"}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 20C8 17.2 5 14.6 5 11.3 5 9.2 6.6 7.6 8.6 7.6c1.3 0 2.5.7 3.1 1.9.6-1.2 1.8-1.9 3.1-1.9 2 0 3.6 1.6 3.6 3.7 0 3.3-3 5.9-7 8.7Z"
            fill="none"
            stroke="#bb676d"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={`font-display text-xl tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}>duviora</span>
    </Link>
  );
}
