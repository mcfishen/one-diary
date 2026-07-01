-- Запусти этот SQL в Supabase → SQL Editor → New query
-- Добавляет комментарий учителя к отклонённым записям и отметку "лучшая запись"

ALTER TABLE posts ADD COLUMN IF NOT EXISTS teacher_note TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
