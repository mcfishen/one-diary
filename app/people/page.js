"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getUser, getProfiles } from "@/lib/db";
import Avatar from "@/components/Avatar";
import BottomNav from "@/components/BottomNav";
import PageShapes from "@/components/PageShapes";
import Link from "next/link";

export default function PeoplePage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.id).then(setProfile);
    getProfiles().then((p) => { setPeople(p); setLoading(false); });
  }, [user, router]);

  const q = search.trim().toLowerCase();
  const visible = people.filter((p) => {
    if (!q) return true;
    return (
      p.display_name?.toLowerCase().includes(q) ||
      p.class?.toLowerCase().includes(q)
    );
  });

  // Группировка по классам для удобной навигации
  const groups = {};
  visible.forEach((p) => {
    const key = p.role === "teacher" ? "Педагоги" : (p.class || "Без класса");
    (groups[key] ||= []).push(p);
  });
  const groupKeys = Object.keys(groups).sort((a, b) => {
    if (a === "Педагоги") return -1;
    if (b === "Педагоги") return 1;
    return a.localeCompare(b, "ru");
  });

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: "var(--color-wh)" }}>
      <PageShapes />

      <div className="px-4 pt-5 pb-4" style={{ background: "var(--color-navy)" }}>
        <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          ONE! International School
        </p>
        <h1 className="text-[18px] font-black text-white tracking-tight">Участники</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          {people.length} {pluralize(people.length)}
        </p>

        <div className="relative mt-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5}
               className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или классу..."
            className="w-full rounded-full pl-10 pr-4 py-2.5 text-[13px] outline-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff" }}
          />
        </div>
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin"
                 style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>Никого не найдено</p>
          </div>
        ) : (
          groupKeys.map((key) => (
            <div key={key} className="mb-4">
              <p className="text-[10px] font-black tracking-widest uppercase mb-2 px-1" style={{ color: "var(--color-sub)" }}>
                {key} · {groups[key].length}
              </p>
              <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--color-card)", boxShadow: "var(--shadow-sm)" }}>
                {groups[key].map((p, i) => (
                  <Link key={p.id} href={`/user/${p.id}`}
                        className="flex items-center gap-3 px-3.5 py-3 transition-colors active:opacity-70"
                        style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-hr)" }}>
                    <Avatar name={p.display_name || ""} photoURL={p.photo_url} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black truncate" style={{ color: "var(--color-title)" }}>
                        {p.display_name || "Без имени"}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--color-sub)" }}>
                        {p.role === "teacher" ? "Педагог" : (p.class || "—")}
                      </p>
                    </div>
                    {p.id === user?.id && (
                      <span className="text-[9px] font-black rounded-full px-2 py-0.5 flex-shrink-0"
                            style={{ background: "var(--color-sl)", color: "var(--color-sub)" }}>
                        это ты
                      </span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-hr)" strokeWidth={2.5}
                         className="w-4 h-4 flex-shrink-0">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav isTeacher={profile?.role === "teacher"} />
    </div>
  );
}

function pluralize(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "участник";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "участника";
  return "участников";
}
