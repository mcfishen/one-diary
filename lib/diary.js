// Справочник погоды для "Заметок путешественника"
export const WEATHER = [
  { key: "sun",   emoji: "☀️",  label: "Ясно" },
  { key: "cloud", emoji: "⛅",  label: "Облачно" },
  { key: "rain",  emoji: "🌧️", label: "Дождь" },
  { key: "snow",  emoji: "❄️",  label: "Снег" },
  { key: "fog",   emoji: "🌫️", label: "Туман" },
  { key: "wind",  emoji: "🌬️", label: "Ветер" },
];

const byKey = Object.fromEntries(WEATHER.map((w) => [w.key, w]));

export const weatherEmoji = (key) => byKey[key]?.emoji || "";
export const weatherLabel = (key) => byKey[key]?.label || "";

// Настроения — общие для формы создания и трека настроения в профиле
export const MOOD_META = [
  { name: "Восторг",       emoji: "🤩" },
  { name: "Интерес",       emoji: "🧐" },
  { name: "Радость",       emoji: "😊" },
  { name: "Удивление",     emoji: "😲" },
  { name: "Задумчивость",  emoji: "🤔" },
  { name: "Спокойствие",   emoji: "😌" },
];

// Подсказки-затравки для дневника исследователя
export const PROMPTS = [
  { emoji: "✨", text: "Что меня удивило:" },
  { emoji: "🧭", text: "Что я узнал нового:" },
  { emoji: "💡", text: "Лучший момент:" },
  { emoji: "🎒", text: "Что взял бы с собой снова:" },
];

export const isVideoUrl = (url) => /\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(url || "");

// Старые ссылки на медиа ведут прямо на supabase.co (заблокирован без VPN).
// Переводим их на наш прокси /db, чтобы фото и видео грузились у всех.
const SUPA_HOST = "okatskswirzuixnlwlie.supabase.co";
export function mediaUrl(u) {
  if (!u || typeof u !== "string") return u;
  const i = u.indexOf(SUPA_HOST);
  if (i === -1) return u;
  return "/db" + u.slice(i + SUPA_HOST.length);
}
