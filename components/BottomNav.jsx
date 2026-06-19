"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "./AuthProvider";

const NAV = [
  {
    href: "/feed",
    label: "Лента",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/create",
    label: "Запись",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ isTeacher }) {
  const path = usePathname();

  const items = isTeacher
    ? [...NAV, { href: "/moderation", label: "Проверка", icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )}]
    : NAV;

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[440px] bg-white rounded-[999px] flex items-center z-50"
      style={{ boxShadow: "var(--shadow-nav)" }}
      aria-label="Навигация"
    >
      {items.map((item) => {
        const active = path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1"
            style={{ color: active ? "var(--color-orange)" : "var(--color-sub)" }}
          >
            {item.icon}
            <span className="text-[9px] font-black tracking-wide">{item.label}</span>
            {active && (
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--color-orange)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
