import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hors ligne",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-[#0B0F19] px-6 pb-10 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] text-center text-slate-100">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/90">Planète Ponzi</p>
      <h1 className="max-w-sm text-2xl font-bold tracking-tight text-white">Vous êtes hors ligne</h1>
      <p className="max-w-md font-mono text-sm text-slate-400">
        La connexion a sauté. Les niveaux déjà chargés peuvent rester disponibles grâce au cache ;
        reconnectez-vous pour synchroniser.
      </p>
      <Link
        href="/"
        className="pp-tap-bounce rounded-pp-xl border border-slate-600/70 bg-slate-900 px-6 py-3 font-mono text-sm font-semibold text-cyan-300 shadow-lg shadow-black/30 hover:bg-slate-800"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
