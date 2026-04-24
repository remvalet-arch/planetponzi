"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  /**
   * Rend la coque dans `document.body` (évite clip `overflow-hidden` / transforms ancêtres).
   * Attend l’hydratation client pour ne pas casser le SSR.
   */
  portalToBody?: boolean;
  /**
   * Bottom sheet « puzzle » : scrim plus dense, z-index élevé, panneau ancré en bas sur mobile
   * (`fixed inset-x-0 bottom-0`), `max-h-[85dvh]`, entrée depuis le bas de l’écran.
   */
  puzzleShopLayout?: boolean;
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
  portalToBody = false,
  puzzleShopLayout = false,
}: BottomSheetShellProps) {
  const finishSwipe = onSwipeDismiss ?? onClose;
  const [portalMounted, setPortalMounted] = useState(false);

  useEffect(() => {
    if (!portalToBody && !puzzleShopLayout) return;
    setPortalMounted(true);
  }, [portalToBody, puzzleShopLayout]);

  const usePortal = (portalToBody || puzzleShopLayout) && portalMounted;

  const backdropMerged = [
    "pp-modal-backdrop",
    puzzleShopLayout
      ? "!z-[999] !bg-slate-950/80 !backdrop-blur-md max-sm:!items-end max-sm:!justify-center max-sm:!p-0 max-sm:!pt-0 max-sm:!pb-0"
      : "",
    backdropClassName,
  ]
    .join(" ")
    .trim();

  const panelMerged = [
    "pp-modal-panel",
    puzzleShopLayout
      ? "max-sm:!fixed max-sm:!bottom-0 max-sm:!left-1/2 max-sm:!mx-0 max-sm:!w-full max-sm:!max-w-md max-sm:!-translate-x-1/2 max-sm:!max-h-[85dvh] sm:!relative sm:!bottom-auto sm:!left-auto sm:!translate-x-0 sm:!mx-auto"
      : "",
    panelClassName,
  ]
    .join(" ")
    .trim();

  const panelMotion = puzzleShopLayout
    ? {
        initial: { y: "62vh", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "36vh", opacity: 0 },
        transition: { type: "spring" as const, stiffness: 420, damping: 34 },
      }
    : {
        initial: { y: 28, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 20, opacity: 0 },
        transition: { type: "spring" as const, stiffness: 420, damping: 32 },
      };

  const tree = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="pp-bottom-sheet"
          role="presentation"
          className={backdropMerged}
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
            className={panelMerged}
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={panelMotion.transition}
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

  if (usePortal && typeof document !== "undefined") {
    return createPortal(tree, document.body);
  }

  if ((portalToBody || puzzleShopLayout) && !portalMounted) {
    return null;
  }

  return tree;
}
