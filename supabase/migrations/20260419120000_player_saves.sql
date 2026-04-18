-- Sauvegarde cloud progression + économie (1 ligne / utilisateur authentifié).

CREATE TABLE IF NOT EXISTS public.player_saves (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  unlocked_levels integer[] NOT NULL DEFAULT ARRAY[1]::integer[],
  stars_by_level jsonb NOT NULL DEFAULT '{}'::jsonb,
  best_score_by_level jsonb NOT NULL DEFAULT '{}'::jsonb,
  boosters jsonb NOT NULL DEFAULT '{"demolition":0,"spy":0,"lobbying":0}'::jsonb,
  prestige_level integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 100,
  lives integer NOT NULL DEFAULT 5,
  last_life_recharge_time bigint,
  last_bonus_date text,
  has_seen_fiscal_freeze_tutorial boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS player_saves_updated_at_idx ON public.player_saves (updated_at DESC);

ALTER TABLE public.player_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_saves_select_own"
  ON public.player_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "player_saves_insert_own"
  ON public.player_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "player_saves_update_own"
  ON public.player_saves FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.player_saves IS 'Sauvegarde Zustand (progress + economy) pour utilisateurs connectés.';
