"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLang } from "./LangProvider";

const NAV_LINKS = [
  { href: "/", labelEn: "Feed", labelZh: "资讯" },
  { href: "/trends", labelEn: "Trends", labelZh: "趋势" },
  { href: "/topics", labelEn: "Topics", labelZh: "话题" },
  { href: "/sources", labelEn: "Sources", labelZh: "来源" },
  { href: "/newsletter", labelEn: "Newsletter", labelZh: "订阅" },
];

export function Header() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold text-lg tracking-tight"
          style={{ fontFamily: "var(--font-spectral)", color: "var(--green)" }}
        >
          AIInfoHub
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[var(--green)] bg-[var(--green-glow)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              {t(link.labelEn, link.labelZh)}
            </Link>
          ))}
        </nav>

        {/* Right side: lang switcher + hamburger */}
        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLang("en")}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                lang === "en"
                  ? "font-semibold text-[var(--green)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
              aria-label="Switch to English"
            >
              EN
            </button>
            <span className="text-[var(--border)] text-xs">|</span>
            <button
              onClick={() => setLang("zh")}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                lang === "zh"
                  ? "font-semibold text-[var(--green)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
              aria-label="切换到中文"
            >
              中文
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: "var(--text-secondary)",
                transform: menuOpen ? "translateY(8px) rotate(45deg)" : undefined,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: "var(--text-secondary)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                backgroundColor: "var(--text-secondary)",
                transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[var(--green)] bg-[var(--green-glow)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              {t(link.labelEn, link.labelZh)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
