import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-auto border-t py-8"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span
            className="font-semibold text-sm"
            style={{ fontFamily: "var(--font-spectral)", color: "var(--green)" }}
          >
            AIInfoHub
          </span>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Curated AI intelligence for developers.
          </p>
        </div>
        <nav className="flex gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          <Link href="/about" className="hover:text-[var(--green)] transition-colors">
            About
          </Link>
          <Link href="/newsletter" className="hover:text-[var(--green)] transition-colors">
            Newsletter
          </Link>
          <Link href="/topics" className="hover:text-[var(--green)] transition-colors">
            Topics
          </Link>
        </nav>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} AIInfoHub
        </p>
      </div>
    </footer>
  );
}
