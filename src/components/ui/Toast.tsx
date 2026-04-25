"use client";

type ToastProps = {
  message: string | null;
};

function inferToastVariant(message: string): "info" | "alert" | "success" {
  const m = message.toLowerCase();
  if (m.includes("insuff") || m.includes("error") || m.includes("impossible") || m.includes("failed")) {
    return "alert";
  }
  if (m.includes("copié") || m.includes("claimed") || m.includes("acquis") || m.includes("success")) {
    return "success";
  }
  return "info";
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  const variant = inferToastVariant(message);
  const toneClass =
    variant === "alert"
      ? "border-rose-500/30 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.16)]"
      : variant === "success"
        ? "border-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.16)]"
        : "border-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.16)]";
  return (
    <div
      className={`pp-toast ${toneClass}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
