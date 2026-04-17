"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Coffee, Map, Trophy } from "lucide-react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

const tabs = [
  { href: "/map", labelKey: "empire" as const, Icon: Map },
  { href: "/leaderboard", labelKey: "leaderboard" as const, Icon: Trophy },
  { href: "/stats", labelKey: "bank" as const, Icon: BarChart3 },
  { href: "/support", labelKey: "support" as const, Icon: Coffee },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useAppStrings();

  return (
    <nav
      className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[60] border-t border-pp-border-strong bg-pp-surface/80 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-lg"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2">
        {tabs.map(({ href, labelKey, Icon }) => {
          const active = pathname === href || (href === "/map" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={`pp-tap-bounce flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-pp-lg px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                active
                  ? "text-pp-accent"
                  : "text-pp-text-muted hover:bg-pp-elevated/80 hover:text-pp-text"
              }`}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.5 : 2} aria-hidden />
              <span className="truncate">{t.nav[labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
