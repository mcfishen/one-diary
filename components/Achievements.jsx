"use client";

export const BADGES = [
  {
    key: "debut",
    emoji: "🌟",
    name: "Дебют",
    desc: "Первая запись опубликована",
    fn: (posts) => posts.length >= 1,
  },
  {
    key: "author",
    emoji: "✍️",
    name: "Автор",
    desc: "5 записей в дневнике",
    fn: (posts) => posts.length >= 5,
  },
  {
    key: "blogger",
    emoji: "📚",
    name: "Блогер",
    desc: "10 записей в дневнике",
    fn: (posts) => posts.length >= 10,
  },
  {
    key: "novelist",
    emoji: "📖",
    name: "Романист",
    desc: "Запись длиннее 300 символов",
    fn: (posts) => posts.some((p) => (p.text?.length || 0) >= 300),
  },
  {
    key: "photographer",
    emoji: "📸",
    name: "Фотограф",
    desc: "Добавил фото к записи",
    fn: (posts) => posts.some((p) => p.media_urls?.length > 0),
  },
  {
    key: "popular",
    emoji: "❤️",
    name: "Популярный",
    desc: "10 реакций суммарно",
    fn: (posts) => posts.reduce((s, p) => s + (p.heart_count || 0) + (p.star_count || 0), 0) >= 10,
  },
  {
    key: "explorer",
    emoji: "🗺️",
    name: "Путешественник",
    desc: "Записи из 3 разных поездок",
    fn: (posts) => new Set(posts.map((p) => p.trip_id).filter(Boolean)).size >= 3,
  },
  {
    key: "star",
    emoji: "⭐",
    name: "Звезда",
    desc: "50 реакций суммарно",
    fn: (posts) => posts.reduce((s, p) => s + (p.heart_count || 0) + (p.star_count || 0), 0) >= 50,
  },
];

export function computeBadges(posts) {
  return BADGES.map((b) => ({ ...b, earned: b.fn(posts) }));
}

export default function Achievements({ posts }) {
  const badges = computeBadges(posts);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--color-label)" }}>
          Достижения
        </p>
        <span className="text-[10px] font-black rounded-full px-2 py-0.5"
              style={{ background: earned > 0 ? "rgba(237,118,21,0.12)" : "var(--color-sl)", color: earned > 0 ? "var(--color-orange)" : "var(--color-sub)" }}>
          {earned} / {badges.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {badges.map((b) => (
          <div key={b.key}
               className="rounded-[12px] p-3 flex items-center gap-2.5 transition-opacity"
               style={{
                 background: b.earned ? "rgba(237,118,21,0.08)" : "var(--color-sl)",
                 border: b.earned ? "1px solid rgba(237,118,21,0.2)" : "1px solid transparent",
                 opacity: b.earned ? 1 : 0.45,
               }}>
            <span className="text-[20px] leading-none flex-shrink-0">{b.emoji}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-black truncate"
                 style={{ color: b.earned ? "var(--color-title)" : "var(--color-sub)" }}>
                {b.name}
              </p>
              <p className="text-[9px] leading-tight mt-0.5" style={{ color: "var(--color-sub)" }}>
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
