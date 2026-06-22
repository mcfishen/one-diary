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

// Подсказки-затравки для дневника исследователя
export const PROMPTS = [
  { emoji: "✨", text: "Что меня удивило:" },
  { emoji: "🧭", text: "Что я узнал нового:" },
  { emoji: "💡", text: "Лучший момент:" },
  { emoji: "🎒", text: "Что взял бы с собой снова:" },
];

export const isVideoUrl = (url) => /\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(url || "");
