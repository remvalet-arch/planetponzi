import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banque",
  description: "Statistiques locales Planet Ponzi Saga.",
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
