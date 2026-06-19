-- Запусти этот SQL в Supabase → SQL Editor → New query

-- 1. Профили пользователей
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  class        TEXT,
  photo_url    TEXT,
  role         TEXT DEFAULT 'student',
  trips_count  INT  DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Школьные поездки
CREATE TABLE trips (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  date       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Записи/посты
CREATE TABLE posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id      UUID REFERENCES trips(id),
  trip_name    TEXT,
  text         TEXT NOT NULL,
  mood         TEXT,
  status       TEXT DEFAULT 'pending',
  author_id    UUID REFERENCES auth.users(id),
  author_name  TEXT,
  author_class TEXT,
  author_photo TEXT,
  media_urls   TEXT[] DEFAULT '{}',
  heart_count  INT  DEFAULT 0,
  star_count   INT  DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Комментарии
CREATE TABLE comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES auth.users(id),
  author_name TEXT,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS (безопасность — включить обязательно!)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Профили
CREATE POLICY "Все видят профили"      ON profiles FOR SELECT USING (true);
CREATE POLICY "Свой профиль — изменять" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Создать свой профиль"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Поездки (все видят, только учителя создают)
CREATE POLICY "Все видят поездки" ON trips FOR SELECT USING (true);
CREATE POLICY "Учитель управляет поездками" ON trips FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Посты
CREATE POLICY "Видеть опубликованные" ON posts FOR SELECT
  USING (status = 'published'
    OR author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Создать пост" ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Учитель меняет статус" ON posts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
    OR author_id = auth.uid());

-- Комментарии
CREATE POLICY "Все видят комментарии"   ON comments FOR SELECT USING (true);
CREATE POLICY "Залогиненные комментируют" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 6. Автоматически создавать профиль при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Тестовая поездка (можно удалить потом)
INSERT INTO trips (name, date) VALUES
  ('Музей Пушкина', '15 мая 2025'),
  ('Природный заповедник Беловежская пуща', '3 июня 2025');
