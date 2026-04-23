"use client";

import Link from "next/link";

import { BottomNav } from "@/src/components/layout/BottomNav";
import { HubShellBar } from "@/src/components/layout/HubShellBar";
import { CloudAuthSection } from "@/src/components/settings/CloudAuthSection";
import { SettingsCeoDisplayName } from "@/src/components/settings/SettingsCeoDisplayName";
import { SettingsHapticsRow } from "@/src/components/settings/SettingsHapticsRow";
import { SettingsSoundRow } from "@/src/components/settings/SettingsSoundRow";
import { SettingsLanguageRow } from "@/src/components/settings/SettingsLanguageRow";
import { DevPlaytestPanel } from "@/src/components/dev/DevPlaytestPanel";
import { useAppStrings } from "@/src/lib/i18n/useAppStrings";

export default function SettingsPage() {
  const { t } = useAppStrings();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0B0F19] text-slate-100">
      <HubShellBar title={t.nav.settings} variant="dark" />
      <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4">
        <SettingsLanguageRow />
        <SettingsHapticsRow />
        <SettingsSoundRow />
        <SettingsCeoDisplayName />
        <div className="flex w-full max-w-sm flex-col gap-3 rounded-pp-xl border border-slate-700/60 bg-slate-900/55 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            {t.cloudSave.sectionTitle}
          </p>
          <p className="font-mono text-xs leading-relaxed text-slate-400">{t.cloudSave.sectionBody}</p>
          <CloudAuthSection />
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/support"
            className="font-mono text-sm text-cyan-400 underline-offset-4 hover:underline"
          >
            {t.nav.support}
          </Link>
          <Link
            href="/map"
            className="font-mono text-sm text-slate-500 underline-offset-4 hover:underline"
          >
            {t.nav.backToMap}
          </Link>
        </div>
      </div>
      <BottomNav variant="dark" />
      <DevPlaytestPanel />
    </div>
  );
}
