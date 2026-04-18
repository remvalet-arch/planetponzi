export type LeaderboardRow = {
  rank: number;
  player_key: string;
  pseudo: string;
  total_stars: number;
  /** Max prestige observé côté serveur (meta des parties). */
  prestige_level: number;
};
