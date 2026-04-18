-- Sprint 4 : profil public (nom PDG) + classement méritocratique (prestige > étoiles > record).

-- ---------------------------------------------------------------------------
-- Profil joueur authentifié (pseudo affiché classement)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_display_name_len CHECK (
    display_name IS NULL OR (char_length(trim(display_name)) >= 1 AND char_length(trim(display_name)) <= 15)
  )
);

COMMENT ON TABLE public.profiles IS
  'Profil public minimal : nom PDG (affichage classement).';

CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles (updated_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC classement : clé = user_id si présent, sinon guest (player_id / device_id)
-- Tri : prestige DESC, total étoiles DESC, meilleur score DESC
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.pp_leaderboard_top50();

CREATE FUNCTION public.pp_leaderboard_top50()
RETURNS TABLE (
  rank bigint,
  player_key text,
  pseudo text,
  total_stars bigint,
  prestige_level bigint,
  max_score bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH keyed AS (
    SELECT
      COALESCE(gc.user_id::text, gc.player_id::text, gc.device_id::text) AS player_key,
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
  scores AS (
    SELECT
      COALESCE(gc.user_id::text, gc.player_id::text, gc.device_id::text) AS player_key,
      MAX(gc.final_score)::bigint AS max_score
    FROM public.game_completions gc
    WHERE (gc.meta->>'sagaLevelId') IS NOT NULL
      AND CAST(gc.meta->>'sagaLevelId' AS integer) >= 1
      AND (gc.meta->>'stars') IS NOT NULL
      AND CAST(gc.meta->>'stars' AS integer) BETWEEN 0 AND 3
    GROUP BY 1
  ),
  latest_pseudo AS (
    SELECT DISTINCT ON (player_key)
      player_key,
      pseudo_src
    FROM (
      SELECT
        COALESCE(gc.user_id::text, gc.player_id::text, gc.device_id::text) AS player_key,
        gc.pseudo AS pseudo_src,
        gc.created_at
      FROM public.game_completions gc
    ) s
    ORDER BY player_key, created_at DESC
  ),
  max_prestige AS (
    SELECT
      COALESCE(gc.user_id::text, gc.player_id::text, gc.device_id::text) AS player_key,
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
    GROUP BY 1
  )
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY
        COALESCE(mp.prestige_level, 0) DESC,
        t.total_stars DESC,
        COALESCE(sc.max_score, 0) DESC,
        t.player_key ASC
    ) AS rank,
    t.player_key,
    COALESCE(
      NULLIF(TRIM(pr.display_name), ''),
      NULLIF(TRIM(lp.pseudo_src), ''),
      'Guest'
    ) AS pseudo,
    t.total_stars,
    COALESCE(mp.prestige_level, 0)::bigint AS prestige_level,
    COALESCE(sc.max_score, 0)::bigint AS max_score
  FROM totals t
  LEFT JOIN latest_pseudo lp ON lp.player_key = t.player_key
  LEFT JOIN max_prestige mp ON mp.player_key = t.player_key
  LEFT JOIN scores sc ON sc.player_key = t.player_key
  LEFT JOIN public.profiles pr ON pr.user_id::text = t.player_key
  ORDER BY
    COALESCE(mp.prestige_level, 0) DESC,
    t.total_stars DESC,
    COALESCE(sc.max_score, 0) DESC,
    t.player_key ASC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.pp_leaderboard_top50() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pp_leaderboard_top50() TO service_role;
