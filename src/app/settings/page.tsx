import Link from "next/link";

import { SettingsLanguageRow } from "@/src/components/settings/SettingsLanguageRow";

export default function SettingsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-pp-bg px-6 pb-8 pt-[max(2rem,calc(env(safe-area-inset-top)+1rem))] text-pp-text">
      <h1 className="font-mono text-lg font-semibold">Paramètres</h1>
      <SettingsLanguageRow />
      <p className="max-w-sm text-center font-mono text-sm text-pp-text-muted">
        Cette section sera enrichie dans une prochaine itération.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/support"
          className="font-mono text-sm text-pp-accent underline-offset-4 hover:underline"
        >
          Soutenir le projet
        </Link>
        <Link
          href="/map"
          className="font-mono text-sm text-pp-text-muted underline-offset-4 hover:underline"
        >
          Retour à la carte
        </Link>
      </div>
    </div>
  );
}
