"use client";
import { MOOD_META } from "@/lib/diary";

export default function MoodTrack({ posts = [] }) {
  const counts = {};
  posts.forEach((p) => { if (p.mood) counts[p.mood] = (counts[p.mood] || 0) + 1; });

  const rows = MOOD_META
    .map((m) => ({ ...m, count: counts[m.name] || 0 }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  if (rows.length === 0) return null;
  const max = rows[0].count;

  return (
    <div>
      <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: "var(--color-label)" }}>
        Настроение поездок
      </p>
      <div className="flex flex-col gap-2.5">
        {rows.map((m) => (
          <div key={m.name} className="flex items-center gap-2.5">
            <span className="text-[16px] w-5 flex-shrink-0">{m.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black truncate" style={{ color: "var(--color-title)" }}>{m.name}</span>
                <span className="text-[10px] font-black flex-shrink-0" style={{ color: "var(--color-sub)" }}>{m.count}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-sl)" }}>
                <div className="h-full rounded-full" style={{ width: `${(m.count / max) * 100}%`, background: "var(--color-orange)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
