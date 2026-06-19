"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getUser, subscribeToPosts, subscribeToPostsByClass, getTrips } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import Link from "next/link";

const FILTERS = ["Все", "Мой класс", "Мои записи"];

function timeAgo(ts) {
  if (!ts) return "";
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function FeedPage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState(0);
  const [tripFilter, setTripFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getTrips().then(setTrips);
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (user) getUser(user.id).then(setProfile);
  }, [user]);

  useEffect(() => {
    if (user === undefined) return;
    let unsub;
    if (filter === 1 && profile) {
      unsub = subscribeToPostsByClass(profile.class, setPosts);
    } else if (filter === 2 && user) {
      unsub = subscribeToPosts((all) => setPosts(all.filter((p) => p.author_id === user.id)));
    } else {
      unsub = subscribeToPosts(setPosts);
    }
    return () => unsub?.();
  }, [filter, user, profile]);

  const visiblePosts = posts.filter((p) => {
    if (tripFilter && p.trip_id !== tripFilter) return false;
    if (search && !p.text?.toLowerCase().includes(search.toLowerCase()) &&
        !p.author_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isGuest = user === null;

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
             style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--color-wh)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-0 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--color-sub)" }}>
            {isGuest ? "ONE! International School" : "Добрый день"}
          </p>
          <h1 className="text-[22px] font-black tracking-tight leading-none mt-0.5" style={{ color: "var(--color-navy)" }}>
            {isGuest ? "Лента поездок" : (profile?.display_name?.split(" ")[0] || "Ученик")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch((s) => !s)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: showSearch ? "var(--color-navy)" : "var(--color-sl)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={showSearch ? "#fff" : "var(--color-sub)"} strokeWidth={2.5} className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {isGuest ? (
            <Link href="/login" className="rounded-full px-3 py-1.5 text-[11px] font-black text-white"
                  style={{ background: "var(--color-orange)" }}>Войти</Link>
          ) : (
            <Link href="/profile">
              <Avatar name={profile?.display_name || ""} photoURL={profile?.photo_url} size={36} />
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="px-4 pt-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Поиск по тексту или автору..."
                 autoFocus
                 className="w-full rounded-full px-4 py-2.5 text-[13px] outline-none"
                 style={{ background: "var(--color-sl)", color: "var(--color-ink)", border: "1.5px solid var(--color-hr)" }} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {(isGuest ? ["Все"] : FILTERS).map((f, i) => (
          <button key={f} onClick={() => setFilter(i)}
                  className="text-[11px] font-black rounded-full px-3.5 py-2 whitespace-nowrap flex-shrink-0 transition-colors"
                  style={{ background: filter === i ? "var(--color-navy)" : "var(--color-sl)", color: filter === i ? "#fff" : "var(--color-sub)" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Trip chips */}
      {trips.length > 0 && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-none">
          <button onClick={() => setTripFilter(null)}
                  className="text-[10px] font-black rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0"
                  style={{ background: !tripFilter ? "var(--color-orange)" : "rgba(237,118,21,0.08)", color: !tripFilter ? "#fff" : "var(--color-orange)", border: "1.5px solid rgba(237,118,21,0.2)" }}>
            Все поездки
          </button>
          {trips.map((t) => (
            <button key={t.id} onClick={() => setTripFilter(tripFilter === t.id ? null : t.id)}
                    className="text-[10px] font-black rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0"
                    style={{ background: tripFilter === t.id ? "var(--color-orange)" : "rgba(237,118,21,0.08)", color: tripFilter === t.id ? "#fff" : "var(--color-orange)", border: "1.5px solid rgba(237,118,21,0.2)" }}>
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Guest banner */}
      {isGuest && (
        <div className="mx-4 mb-2 rounded-[14px] px-4 py-3 flex items-center justify-between"
             style={{ background: "var(--color-mint)" }}>
          <p className="text-[12px] font-black" style={{ color: "var(--color-navy)" }}>
            Войди чтобы делиться записями
          </p>
          <Link href="/login" className="rounded-full px-3 py-1.5 text-[11px] font-black text-white flex-shrink-0"
                style={{ background: "var(--color-navy)" }}>Войти</Link>
        </div>
      )}

      {/* Posts */}
      <div className="px-4">
        {visiblePosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--color-sl)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-hr)" strokeWidth={1.5} className="w-8 h-8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>
              {search ? "Ничего не найдено" : "Записей пока нет"}
            </p>
          </div>
        ) : (
          visiblePosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <BottomNav isTeacher={profile?.role === "teacher"} isGuest={isGuest} />
    </div>
  );
}
