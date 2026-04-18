"use client";

import Link from "next/link";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { HubShellBar } from "@/src/components/layout/HubShellBar";
import { CloudAuthSection } from "@/src/components/settings/CloudAuthSection";
import { SettingsCeoDisplayName } from "@/src/components/settings/SettingsCeoDisplayName";
import { SettingsLanguageRow } from "@/src/components/settings/SettingsLanguageRow";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

export default function SettingsPage() {
  const { t } = useAppStrings();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pp-bg text-pp-text">
      <HubShellBar title={t.nav.settings} />
      <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4">
        <SettingsLanguageRow />
        <SettingsCeoDisplayName />
        <div className="flex w-full max-w-sm flex-col gap-3 rounded-pp-xl border border-pp-border-strong bg-pp-elevated/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-pp-text-dim">
            {t.cloudSave.sectionTitle}
          </p>
          <p className="font-mono text-xs leading-relaxed text-pp-text-muted">{t.cloudSave.sectionBody}</p>
          <CloudAuthSection />
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/support"
            className="font-mono text-sm text-pp-accent underline-offset-4 hover:underline"
          >
            {t.nav.support}
          </Link>
          <Link
            href="/map"
            className="font-mono text-sm text-pp-text-muted underline-offset-4 hover:underline"
          >
            {t.nav.backToMap}
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
