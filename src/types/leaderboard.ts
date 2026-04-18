export type LeaderboardRow = {
  rank: number;
  player_key: string;
  pseudo: string;
  total_stars: number;
  /** Max prestige observé côté serveur (meta des parties). */
  prestige_level: number;
  /** Meilleur score final (parties Saga comptabilisées pour le classement). */
  max_score: number;
};
