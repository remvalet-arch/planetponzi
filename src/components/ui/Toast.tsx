"use client";

type ToastProps = {
  message: string | null;
};

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      className="pp-toast text-emerald-200"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
