"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";

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
  /**
   * Action après un swipe vers le bas prononcé sur le panneau.
   * Défaut : `onClose`. Ex. mandat : même effet que le CTA « Lancer ».
   */
  onSwipeDismiss?: () => void;
  /** Désactive le geste de fermeture par glisser vers le bas. */
  disableSwipeDown?: boolean;
};

/**
 * Coque commune des bottom sheets : scrim, panneau arrondi haut, handle, animations.
 */
function shouldDismissFromSwipe(info: PanInfo): boolean {
  return info.offset.y > 100 || info.velocity.y > 500;
}

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
  onSwipeDismiss,
  disableSwipeDown = false,
}: BottomSheetShellProps) {
  const finishSwipe = onSwipeDismiss ?? onClose;

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
            drag={disableSwipeDown ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (disableSwipeDown) return;
              if (shouldDismissFromSwipe(info)) finishSwipe();
            }}
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
