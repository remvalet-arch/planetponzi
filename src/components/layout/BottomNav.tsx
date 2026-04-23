"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Map, ShoppingCart } from "lucide-react";

import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

const tabs = [
  { href: "/map", labelKey: "map" as const, Icon: Map },
  { href: "/empire", labelKey: "empire" as const, Icon: Building2 },
  { href: "/shop", labelKey: "shop" as const, Icon: ShoppingCart },
];

type BottomNavProps = {
  /** Barre sombre (ex. boutique) pour coller au shell dark. */
  variant?: "light" | "dark";
};

export function BottomNav({ variant = "light" }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useAppStrings();
  const isDark = variant === "dark";

  return (
    <nav
      className={
        isDark
          ? "pointer-events-auto fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/60 bg-slate-950/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 text-slate-100 backdrop-blur-lg"
          : "pointer-events-auto fixed bottom-0 left-0 right-0 z-50 border-t border-pp-border-strong bg-pp-surface/80 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-lg"
      }
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-3">
        {tabs.map(({ href, labelKey, Icon }) => {
          const active = pathname === href || (href === "/map" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={`pp-tap-bounce flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-pp-lg px-2 py-1.5 font-mono text-[11px] font-semibold transition-colors sm:min-h-14 sm:text-xs ${
                active
                  ? isDark
                    ? "text-cyan-300"
                    : "text-pp-accent"
                  : isDark
                    ? "text-slate-500 hover:bg-slate-800/70 hover:text-slate-200"
                    : "text-pp-text-muted hover:bg-pp-elevated/80 hover:text-pp-text"
              }`}
            >
              <Icon className="size-6 shrink-0" strokeWidth={active ? 2.5 : 2} aria-hidden />
              <span className="truncate">{t.nav[labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
