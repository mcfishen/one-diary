-- Запусти этот SQL в Supabase → SQL Editor → New query
-- Добавляет поля "Место" и "Погода" для Заметок путешественника

ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS weather  TEXT;
