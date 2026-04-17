-- Profil guest (player_id, pseudo) + agrégation classement (meilleures étoiles par niveau Saga).

ALTER TABLE public.game_completions
  ADD COLUMN IF NOT EXISTS player_id uuid,
  ADD COLUMN IF NOT EXISTS pseudo text;

CREATE INDEX IF NOT EXISTS game_completions_player_id_created_idx
  ON public.game_completions (player_id, created_at DESC)
  WHERE player_id IS NOT NULL;

COMMENT ON COLUMN public.game_completions.player_id IS
  'UUID joueur guest (store progression), en complément du device_id historique.';
COMMENT ON COLUMN public.game_completions.pseudo IS
  'Pseudo CEO (tronqué côté app, max 15 caractères).';

-- Top 50 : somme des meilleures étoiles par sagaLevelId (meta) pour chaque joueur (player_id sinon device_id).
CREATE OR REPLACE FUNCTION public.pp_leaderboard_top50()
RETURNS TABLE (
  rank bigint,
  player_key text,
  pseudo text,
  total_stars bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH keyed AS (
    SELECT
      COALESCE(gc.player_id::text, gc.device_id::text) AS player_key,
      (gc.meta->>'sagaLevelId')::integer AS level_id,
      (gc.meta->>'stars')::integer AS stars
    FROM public.game_completions gc
    WHERE (gc.meta->>'sagaLevelId') ~ '^[1-9][0-9]*$'
      AND (gc.meta->>'stars') ~ '^[0-3]$'
  ),
  per_level AS (
    SELECT player_key, level_id, MAX(stars)::bigint AS best_stars
    FROM keyed
    WHERE level_id IS NOT NULL AND level_id >= 1
    GROUP BY player_key, level_id
  ),
  totals AS (
    SELECT pl.player_key, SUM(pl.best_stars)::bigint AS total_stars
    FROM per_level pl
    GROUP BY pl.player_key
  ),
  latest_pseudo AS (
    SELECT DISTINCT ON (player_key)
      player_key,
      COALESCE(NULLIF(TRIM(pseudo_src), ''), 'Guest') AS pseudo
    FROM (
      SELECT
        COALESCE(gc.player_id::text, gc.device_id::text) AS player_key,
        gc.pseudo AS pseudo_src,
        gc.created_at
      FROM public.game_completions gc
    ) s
    ORDER BY player_key, created_at DESC
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY t.total_stars DESC, t.player_key ASC) AS rank,
    t.player_key,
    COALESCE(lp.pseudo, 'Guest') AS pseudo,
    t.total_stars
  FROM totals t
  LEFT JOIN latest_pseudo lp ON lp.player_key = t.player_key
  ORDER BY t.total_stars DESC, t.player_key ASC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.pp_leaderboard_top50() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pp_leaderboard_top50() TO service_role;
