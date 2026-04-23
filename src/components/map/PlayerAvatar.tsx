"use client";

import { motion } from "framer-motion";

import { ContractIcon } from "@/src/components/ui/ContractIcon";

/** Marque « The Tycoon » : costume + contrat, balancement type marche fière. */
export function CeoTycoonMark() {
  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        rotate: [-5, 5, -5],
        y: [0, -3, 0],
      }}
      transition={{
        duration: 2.6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      aria-hidden
    >
      <span className="relative text-[1.65rem] leading-none drop-shadow-[0_4px_14px_rgb(0_0_0/0.55)]">
        🕴️
        <span className="absolute -bottom-1 -right-1.5 scale-[0.42] origin-bottom-right opacity-95">
          <ContractIcon count={1} size="md" seal="gold" />
        </span>
      </span>
      <span className="mt-1 rounded-full border border-amber-400/45 bg-slate-950/85 px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-widest text-amber-100/95">
        CEO
      </span>
    </motion.div>
  );
}
