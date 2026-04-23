import type { Metadata } from "next";

import { SupportShell } from "./SupportShell";

export const metadata: Metadata = {
  title: "Soutien",
  description: "Soutenir le développement de Planète Ponzi.",
};

export default function SupportPage() {
  return <SupportShell />;
}
