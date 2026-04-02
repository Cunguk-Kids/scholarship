import { Link, useLocation } from "@tanstack/react-router";
import { NeoButton } from "./ui/NeoButton";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBreakpoint } from "@/hooks/use-breakpoint";

const navItems = [
  { href: "/programs",  label: "Programs",  icon: "📚" },
  { href: "/vote",      label: "Vote",      icon: "🗳️" },
  { href: "/disputes",  label: "Disputes",  icon: "⚖️" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const breakpoint = useBreakpoint();
  const location = useLocation();
  const currentPath = location.pathname;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: "-100%" },
      { opacity: 1, y: "0%", duration: 0.8, ease: "power3.out" }
    );
  }, []);

  return (
    <header
      ref={ref}
      className="flex max-lg:flex-col py-4 px-6 bg-white m-6 md:m-9 justify-between items-center rounded-2xl border-2 border-black neo-shadow sticky top-6 z-50"
    >
      <div className="flex justify-between max-lg:self-stretch items-center">
        <Link to="/programs" className="flex items-center gap-2">
          <img src="/skoolcein-logo.svg" alt="Skoolchain" className="h-8" />
        </Link>
        <button
          className="hidden max-lg:flex items-center justify-center w-10 h-10 rounded-lg border-2 border-black neo-shadow-sm active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
          onClick={() => setOpen(!open)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className={`max-lg:self-stretch ${open ? "max-lg:block" : "max-lg:hidden"}`}>
        <ul className="flex gap-1 text-gray-800 items-center max-lg:flex-col max-lg:items-start max-lg:mt-5">
          {navItems.map(({ href, label, icon }) => {
            const isActive = currentPath === href || currentPath.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  to={href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-1.5 py-2 px-3 rounded-xl font-bold text-sm transition-all duration-200
                    ${isActive
                      ? "bg-skpurple text-white neo-shadow-sm"
                      : "hover:bg-skpurple-light hover:text-skpurple"
                    }
                  `}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        {breakpoint.isLessThan("lg") && (
          <div className="mt-4 mb-2">
            <NeoButton label="Connect Wallet" variant="connect" size="md" fullWidth />
          </div>
        )}
      </nav>

      {breakpoint.isAtLeast("lg") && (
        <NeoButton label="Connect Wallet" variant="connect" size="md" />
      )}
    </header>
  );
}
