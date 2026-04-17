import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hors ligne",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-pp-bg px-6 py-10 text-center text-pp-text">
      <p className="pp-kicker">Planet Ponzi Saga</p>
      <h1 className="max-w-sm text-2xl font-bold tracking-tight">Vous êtes hors ligne</h1>
      <p className="max-w-md font-mono text-sm text-pp-text-muted">
        La connexion a sauté. Les niveaux déjà chargés peuvent rester disponibles grâce au cache ;
        reconnectez-vous pour synchroniser.
      </p>
      <Link
        href="/"
        className="pp-tap-bounce rounded-pp-xl border border-pp-border-strong bg-pp-surface px-6 py-3 font-mono text-sm font-semibold text-pp-accent shadow-lg hover:bg-pp-elevated"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
