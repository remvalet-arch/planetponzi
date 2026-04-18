"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type BottomSheetShellProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Zone fixe sous le contenu scrollable (CTA). */
  footer?: ReactNode;
  /** Classes du conteneur backdrop (z-index, couleur). */
  backdropClassName?: string;
  /** Classes additionnelles sur le panneau (dégradés, bordures). */
  panelClassName?: string;
  /** Fermer au clic sur le scrim (hors panneau). Défaut : true. */
  closeOnBackdropPress?: boolean;
  /** Afficher le tiret central. Défaut : true. */
  showHandle?: boolean;
  /** Classe du tiret (ex. briefing : fond clair). */
  handleClassName?: string;
};

/**
 * Coque commune des bottom sheets : scrim, panneau arrondi haut, handle, animations.
 */
export function BottomSheetShell({
  open,
  onClose,
  children,
  footer,
  backdropClassName = "",
  panelClassName = "",
  closeOnBackdropPress = true,
  showHandle = true,
  handleClassName = "",
}: BottomSheetShellProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="pp-bottom-sheet"
          role="presentation"
          className={`pp-modal-backdrop ${backdropClassName}`.trim()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onMouseDown={(e) => {
            if (!closeOnBackdropPress) return;
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`pp-modal-panel ${panelClassName}`.trim()}
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {showHandle ? (
              <div
                className={`pp-bottom-sheet-handle ${handleClassName}`.trim()}
                aria-hidden
              />
            ) : null}
            {children}
            {footer ? footer : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
