import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "Timeline", href: "/" },
  { label: "Rolodex", href: "/rolodex" },
  { label: "Members", href: "/members" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--nav-height",
        `${headerRef.current?.offsetHeight ?? 0}px`,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className="border-b border-border/50 bg-ash/90 backdrop-blur"
      ref={headerRef}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-bright">
            Italy 2026
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {navItems.map((item) => {
              const active = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition ${
                    active
                      ? "text-bright"
                      : "text-fog/70 hover:text-bright"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="pill text-bright md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-border/40 bg-ash/95"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-sm">
            {navItems.map((item) => {
              const active = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 transition ${
                    active
                      ? "bg-slate/70 text-bright"
                      : "text-fog/70 hover:bg-slate/60 hover:text-bright"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
