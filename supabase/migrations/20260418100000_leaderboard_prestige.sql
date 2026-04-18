-- Classement : prestige max observé dans meta (game_completions).
-- Le type de retour change (colonne prestige) : il faut DROP avant CREATE (CREATE OR REPLACE ne suffit pas).

DROP FUNCTION IF EXISTS public.pp_leaderboard_top50();

CREATE FUNCTION public.pp_leaderboard_top50()
RETURNS TABLE (
  rank bigint,
  player_key text,
  pseudo text,
  total_stars bigint,
  prestige_level bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH keyed AS (
    SELECT
      COALESCE(gc.player_id::text, gc.device_id::text) AS player_key,
      CAST(gc.meta->>'sagaLevelId' AS integer) AS level_id,
      CAST(gc.meta->>'stars' AS integer) AS stars
    FROM public.game_completions gc
    WHERE (gc.meta->>'sagaLevelId') IS NOT NULL
      AND CAST(gc.meta->>'sagaLevelId' AS integer) >= 1
      AND (gc.meta->>'stars') IS NOT NULL
      AND CAST(gc.meta->>'stars' AS integer) BETWEEN 0 AND 3
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
  ),
  max_prestige AS (
    SELECT
      COALESCE(gc.player_id::text, gc.device_id::text) AS player_key,
      MAX(
        CASE
          WHEN gc.meta IS NOT NULL
            AND (gc.meta->>'prestigeLevel') IS NOT NULL
            AND (gc.meta->>'prestigeLevel') ~ '^[0-9]+$'
          THEN LEAST(1000, GREATEST(0, CAST(gc.meta->>'prestigeLevel' AS integer)))
          ELSE 0
        END
      )::bigint AS prestige_level
    FROM public.game_completions gc
    GROUP BY COALESCE(gc.player_id::text, gc.device_id::text)
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY t.total_stars DESC, t.player_key ASC) AS rank,
    t.player_key,
    COALESCE(lp.pseudo, 'Guest') AS pseudo,
    t.total_stars,
    COALESCE(mp.prestige_level, 0)::bigint AS prestige_level
  FROM totals t
  LEFT JOIN latest_pseudo lp ON lp.player_key = t.player_key
  LEFT JOIN max_prestige mp ON mp.player_key = t.player_key
  ORDER BY t.total_stars DESC, t.player_key ASC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.pp_leaderboard_top50() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pp_leaderboard_top50() TO service_role;
