import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "./Button";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useBreakpoint } from "@/hooks/use-breakpoint";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/vote", label: "Vote" },
  { href: "/dashboard", label: "Dashboard" },
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
      { opacity: 0, y: "100%" },
      { opacity: 1, y: "0%", duration: 2, ease: "power3.out" }
    );
  }, []);

  return (
    <header
      ref={ref}
      className="flex max-lg:flex-col py-[1.375rem] px-6 bg-white m-9 max-md:mx-3 justify-between items-center rounded-2xl border-2 border-black inset-shadow-sksm shrink-0 z-10"
    >
      <div className="flex justify-between max-lg:self-stretch">
        <img src="/skoolcein-logo.svg" alt="logo" />
        <button className="hidden max-lg:block" onClick={() => {
          console.log("clicked");
          setOpen(!open);
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4 5H20"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 12H20"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 19H20"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <nav
        className={`max-lg:self-stretch ${open ? "max-lg:block" : "max-lg:hidden"}`}
      >
        <ul className="flex gap-6 text-gray-800 items-center max-lg:flex-col max-lg:items-start max-lg:mt-5">
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
        {breakpoint.isLessThan("lg") && (
          <Button
            wrapperClassName="mt-5"
            label="Connect Wallet"
            type="connect"
          />
        )}
      </nav>
      {breakpoint.isAtLeast("lg") && (
        <Button label="Connect Wallet" type="connect" />
      )}
    </header>
  );
}
