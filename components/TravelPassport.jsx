"use client";

function stampRotation(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return (h % 17) - 8; // -8..8 градусов, для "неаккуратного" вида штампа
}

export default function TravelPassport({ posts = [], trips = [] }) {
  const tripsById = Object.fromEntries(trips.map((t) => [t.id, t]));

  const visited = {};
  posts.forEach((p) => {
    if (!p.trip_id) return;
    const existing = visited[p.trip_id];
    if (!existing || new Date(p.created_at) < new Date(existing.created_at)) {
      visited[p.trip_id] = p;
    }
  });

  const stamps = Object.entries(visited).map(([tripId, post]) => ({
    id: tripId,
    name: tripsById[tripId]?.name || post.trip_name || "Поездка",
    date: tripsById[tripId]?.date ||
      new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
  }));

  if (stamps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 px-6 text-center">
        <span className="text-[32px]">🛂</span>
        <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>Паспорт пока пуст</p>
        <p className="text-[11px]" style={{ color: "var(--color-sub)" }}>
          Опубликуй первую запись — получишь первый штамп
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: "var(--color-label)" }}>
        Паспорт путешественника · {stamps.length}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {stamps.map((s) => (
          <div key={s.id}
               className="rounded-[14px] p-3.5 flex flex-col items-center text-center gap-1"
               style={{
                 border: "2px dashed var(--color-orange)",
                 background: "rgba(237,118,21,0.05)",
                 transform: `rotate(${stampRotation(s.id)}deg)`,
               }}>
            <span className="text-[22px] leading-none">🧭</span>
            <p className="text-[11px] font-black leading-tight" style={{ color: "var(--color-title)" }}>
              {s.name}
            </p>
            <p className="text-[9px] font-black tracking-wide" style={{ color: "var(--color-orange)" }}>
              {s.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
