"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Canvus wordmark ─────────────────────────────────────────────────────── */
const Wordmark = () => (
  <Link href="/" className="group flex items-center gap-2.5 select-none">
    {/* Logo mark – two overlapping rounded squares */}
    <div className="relative w-8 h-8">
      <div
        className="absolute inset-0 rounded-lg bg-primary/80 rotate-12 scale-90
                    group-hover:rotate-6 transition-transform duration-300"
      />
      <div
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-container to-primary
                    group-hover:rotate-3 transition-transform duration-300"
      />
    </div>
    <span
      className="text-[22px] font-extrabold tracking-[-0.04em] text-on-surface
                  bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text"
    >
      CanvUs
    </span>
  </Link>
);

/* ─── Nav link ────────────────────────────────────────────────────────────── */
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="relative px-3 py-1.5 text-[13px] font-medium tracking-wide text-on-surface-variant
               hover:text-on-surface transition-colors duration-200
               after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
               after:w-0 after:h-[2px] after:bg-primary after:rounded-full
               after:transition-all after:duration-300
               hover:after:w-4/5"
  >
    {children}
  </Link>
);

/* ─── Header ──────────────────────────────────────────────────────────────── */
function Header() {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  return (
    <header
      className="sticky top-0 z-50 w-full
                  bg-surface/60 backdrop-blur-[20px]
                  border-b border-white/[0.06]"
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between h-16 px-6">
        {/* ── Left: wordmark ── */}
        <Wordmark />

        {/* ── Center: navigation ── */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/dashboard">Canvas</NavLink>
          <NavLink href="#">Community</NavLink>
        </nav>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            onMouseEnter={() => setHoveredBtn("login")}
            onMouseLeave={() => setHoveredBtn(null)}
            className="relative px-5 py-2 text-[13px] font-semibold tracking-wide
                       text-on-surface-variant hover:text-on-surface
                       rounded-full border border-outline-variant/40
                       transition-all duration-200
                       hover:border-outline-variant/70 hover:bg-surface-container-high/40"
          >
            Log in
            {hoveredBtn === "login" && (
              <span className="absolute inset-0 rounded-full bg-primary/[0.04] animate-pulse pointer-events-none" />
            )}
          </Link>
          <Link
            href="/sign-up"
            onMouseEnter={() => setHoveredBtn("start")}
            onMouseLeave={() => setHoveredBtn(null)}
            className="relative px-5 py-2 text-[13px] font-semibold tracking-wide
                       text-on-primary bg-primary-container rounded-full
                       transition-all duration-200
                       hover:shadow-[0_0_20px_rgba(86,141,255,0.35)]
                       hover:brightness-110 active:scale-[0.97]"
          >
            Start creating
            {hoveredBtn === "start" && (
              <span className="absolute inset-0 rounded-full bg-white/[0.08] pointer-events-none" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
