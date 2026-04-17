import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-pp-bg px-6 py-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-pp-accent/80">
        404 · Mandat introuvable
      </p>
      <h1 className="mt-4 font-mono text-2xl font-bold text-pp-text">
        Cette orbite n’existe pas
      </h1>
      <p className="mt-3 max-w-sm font-mono text-sm text-pp-text-muted">
        Le board a reclassé cette URL en « opportunité stratégique reportée ».
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-12 items-center justify-center rounded-pp-lg border border-pp-border-strong bg-pp-elevated px-6 font-mono text-sm font-semibold text-pp-accent transition-colors hover:border-pp-accent/50 hover:bg-pp-surface"
      >
        Retour au QG
      </Link>
    </div>
  );
}
