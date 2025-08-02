import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "./Button";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/vote", label: "Vote" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: "100%" },
      { opacity: 1, y: "0%", duration: 2, ease: "power3.out" }
    );
  }, []);

  return (
    <header
      ref={ref}
      className="flex py-[1.375rem] px-6 bg-white m-9 justify-between items-center rounded-2xl border-2 border-black inset-shadow-sksm shrink-0 z-10"
    >
      <img src="/skoolcein-logo.svg" alt="logo" />
      <nav>
        <ul className="flex gap-6 text-gray-800 items-center">
          {navItems.map(({ href, label }) => {
            const isActive = currentPath === href;
            return (
              <li key={href}>
                <Link
                  to={href}
                  className={`flex py-2 px-2.5 justify-center items-center gap-2.5 font-medium transition-all duration-200 ${
                    isActive
                      ? "font-extrabold text-skpurple"
                      : "hover:text-skpurple"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Button label="Connect Wallet" type="connect" />
    </header>
  );
}
