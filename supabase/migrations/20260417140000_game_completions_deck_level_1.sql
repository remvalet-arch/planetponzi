-- Autoriser deck_challenge_level = 1 (1 type masqué), aligné avec l’app (DECK_CHALLENGE_LEVELS).

ALTER TABLE public.game_completions
  DROP CONSTRAINT IF EXISTS game_completions_deck_level_chk;

ALTER TABLE public.game_completions
  ADD CONSTRAINT game_completions_deck_level_chk
  CHECK (deck_challenge_level IN (0, 1, 2, 3, 4));
