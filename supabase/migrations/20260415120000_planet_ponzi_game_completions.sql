-- Planet Ponzi — schéma initial (historique des parties + base pour stats serveur)
-- Appliquer avec : `supabase db push` (projet lié) ou coller dans SQL Editor du dashboard Supabase.
--
-- Modèle :
-- - Chaque ligne = une partie terminée (grille complète, score final).
-- - `user_id` : rempli quand Supabase Auth est branché (nullable avant login).
-- - `device_id` : UUID stable côté client (localStorage), pour regrouper l’historique sans compte.
-- - Les écritures anonymes depuis le navigateur se font plutôt via une Route Handler Next.js
--   (clé service) tant que les politiques RLS ci-dessous exigent un utilisateur connecté.

-- ---------------------------------------------------------------------------
-- Table principale : historique des parties terminées
-- ---------------------------------------------------------------------------

CREATE TABLE public.game_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- Compte Supabase (optionnel au début du produit)
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,

  -- Identifiant navigateur / appareil (obligatoire côté app : généré une fois, stocké en local)
  device_id uuid NOT NULL,

  -- Date du puzzle (YYYY-MM-DD, fuseau géré par l’app — aligné sur getLocalDateSeed())
  puzzle_date date NOT NULL,

  deck_challenge_level smallint NOT NULL,
  final_score integer NOT NULL,
  turns_completed smallint NOT NULL DEFAULT 16,

  -- Grille finale : [{ "index": 0, "building": "mine" | null }, ...]
  grid jsonb NOT NULL,
  -- Ordre des 16 placements du jour
  daily_building_sequence jsonb NOT NULL,

  -- Métadonnées libres (version app, locale IANA, etc.)
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT game_completions_deck_level_chk
    CHECK (deck_challenge_level IN (0, 2, 3, 4)),

  CONSTRAINT game_completions_turns_chk
    CHECK (turns_completed >= 0 AND turns_completed <= 16),

  CONSTRAINT game_completions_sequence_is_array_of_16_chk
    CHECK (
      jsonb_typeof(daily_building_sequence) = 'array'
      AND jsonb_array_length(daily_building_sequence) = 16
    ),

  CONSTRAINT game_completions_grid_is_array_of_16_chk
    CHECK (
      jsonb_typeof(grid) = 'array'
      AND jsonb_array_length(grid) = 16
    )
);

COMMENT ON TABLE public.game_completions IS
  'Historique des parties terminées (score, date du puzzle, difficulté deck, snapshots JSON).';

COMMENT ON COLUMN public.game_completions.device_id IS
  'UUID généré par le client (ex. clé localStorage) pour corréler les parties avant toute auth.';

COMMENT ON COLUMN public.game_completions.puzzle_date IS
  'Date du mandat quotidien (date-only), cohérente avec la seed YYYY-MM-DD du jeu.';

-- ---------------------------------------------------------------------------
-- Index pour requêtes typiques (profil, calendrier, admin)
-- ---------------------------------------------------------------------------

CREATE INDEX game_completions_user_created_idx
  ON public.game_completions (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX game_completions_device_created_idx
  ON public.game_completions (device_id, created_at DESC);

CREATE INDEX game_completions_puzzle_date_idx
  ON public.game_completions (puzzle_date DESC);

CREATE INDEX game_completions_puzzle_date_score_idx
  ON public.game_completions (puzzle_date, final_score DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security (utilisateur connecté)
-- ---------------------------------------------------------------------------

ALTER TABLE public.game_completions ENABLE ROW LEVEL SECURITY;

-- Lecture : uniquement ses lignes (compte lié)
CREATE POLICY game_completions_select_own
  ON public.game_completions
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Insertion : uniquement pour soi (user_id obligatoire pour passer la policy)
CREATE POLICY game_completions_insert_own
  ON public.game_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- Mise à jour : ex. rattachement métadonnées (éviter changer user_id depuis le client en prod sans garde-fous)
CREATE POLICY game_completions_update_own
  ON public.game_completions
  FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- Suppression volontairement absente (historique conservé ; ajouter une policy DELETE si besoin RGPD)

-- ---------------------------------------------------------------------------
-- Grants (API Supabase avec JWT utilisateur)
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON public.game_completions TO authenticated;

-- Le rôle service (Route Handler serveur, clé service_role) bypass RLS par défaut :
-- à utiliser pour enregistrer une completion avec seulement device_id avant login.

-- ---------------------------------------------------------------------------
-- Fonction : rattacher les parties d’un appareil au compte courant après login
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.attach_game_completions_to_user(
  p_device_id uuid,
  p_target_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'attach_game_completions_to_user: p_target_user_id requis';
  END IF;

  UPDATE public.game_completions
  SET user_id = p_target_user_id
  WHERE device_id = p_device_id
    AND user_id IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.attach_game_completions_to_user(uuid, uuid) IS
  'Associe les lignes anonymes (user_id NULL) du p_device_id au compte p_target_user_id. '
  'À appeler uniquement depuis une Route Handler (service_role) après vérification du JWT utilisateur.';

REVOKE ALL ON FUNCTION public.attach_game_completions_to_user(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.attach_game_completions_to_user(uuid, uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- Vues agrégées (stats pour UI / reporting ; soumises au même RLS sur la table de base)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_user_completion_stats AS
SELECT
  user_id,
  count(*)::bigint AS games_completed,
  max(final_score) AS best_score,
  round(avg(final_score)::numeric, 1) AS avg_score,
  min(created_at) AS first_completion_at,
  max(created_at) AS last_completion_at
FROM public.game_completions
WHERE user_id IS NOT NULL
GROUP BY user_id;

COMMENT ON VIEW public.v_user_completion_stats IS
  'Agrégat par utilisateur authentifié (compteur parties, meilleur score, moyenne).';

GRANT SELECT ON public.v_user_completion_stats TO authenticated;

-- Agrégats globaux « par jour de puzzle » (tous joueurs) : requêter avec service_role
-- (ex. SQL Editor ou job serveur), pas via RLS client, pour ne pas exposer d’autres scores.
