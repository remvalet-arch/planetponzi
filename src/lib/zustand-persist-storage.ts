import { createJSONStorage, type StateStorage } from "zustand/middleware";

/** Stockage no-op côté serveur / prerender pour que `persist` attache toujours `api.persist`. */
const noopWebStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * `localStorage` n’existe pas en Node (build Next / Vercel) : sans fallback,
 * `createJSONStorage` renvoie `undefined` et Zustand n’expose pas `store.persist`.
 */
export const persistLocalStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noopWebStorage : window.localStorage,
);
