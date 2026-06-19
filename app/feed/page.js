"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getUser, subscribeToPosts, subscribeToPostsByClass } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";

const FILTERS = ["Все поездки", "Мой класс", "Мои записи"];

export default function FeedPage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState(0);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.uid).then(setProfile);
  }, [user, router]);

  useEffect(() => {
    if (!user || !profile) return;
    let unsub;
    if (filter === 1) {
      unsub = subscribeToPostsByClass(profile.class, setPosts);
    } else if (filter === 2) {
      unsub = subscribeToPosts((all) =>
        setPosts(all.filter((p) => p.authorId === user.uid))
      );
    } else {
      unsub = subscribeToPosts(setPosts);
    }
    return () => unsub?.();
  }, [filter, user, profile]);

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
            Добрый день
          </p>
          <h1 className="text-[22px] font-black tracking-tight leading-none mt-0.5" style={{ color: "var(--color-navy)" }}>
            {profile?.displayName?.split(" ")[0] || "Ученик"}
          </h1>
        </div>
        <Avatar name={profile?.displayName || ""} photoURL={profile?.photoURL} size={36} />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            onClick={() => setFilter(i)}
            className="text-[11px] font-black rounded-full px-3.5 py-2 whitespace-nowrap flex-shrink-0 transition-colors"
            style={{
              background: filter === i ? "var(--color-navy)" : "var(--color-sl)",
              color: filter === i ? "#fff" : "var(--color-sub)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="px-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: "var(--color-sl)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-hr)" strokeWidth={1.5} className="w-8 h-8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>
              Записей пока нет
            </p>
            <p className="text-[12px] text-center" style={{ color: "var(--color-hr)" }}>
              Будь первым — добавь впечатления<br />о школьной поездке
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <BottomNav isTeacher={profile?.role === "teacher"} />
    </div>
  );
}
