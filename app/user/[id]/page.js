"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getUser, getUserPosts } from "@/lib/db";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/components/AuthProvider";
import Achievements from "@/components/Achievements";
import HeroShapes from "@/components/HeroShapes";
import PageShapes from "@/components/PageShapes";
import { mediaUrl, isVideoUrl } from "@/lib/diary";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "ruslanfom2@gmail.com";

export default function UserProfilePage({ params }) {
  const { id } = use(params);
  const currentUser = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [tab, setTab] = useState(0);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState("");

  async function handleDeleteUser() {
    setDeleting(true);
    setDelError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDelError(data.error || "Не удалось удалить.");
        setDeleting(false);
      } else {
        router.replace("/people");
      }
    } catch {
      setDelError("Ошибка сети.");
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    getUser(id).then(setProfile);
    getUserPosts(id).then(setPosts);
  }, [id]);

  useEffect(() => {
    if (currentUser) getUser(currentUser.id).then(setMyProfile);
  }, [currentUser]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
             style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const totalReactions = posts.reduce((s, p) => s + (p.heart_count || 0) + (p.star_count || 0), 0);
  const uniqueTrips = new Set(posts.map((p) => p.trip_id).filter(Boolean)).size;
  const isOwnProfile = currentUser?.id === id;

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: "var(--color-wh)" }}>
      <PageShapes />
      <div className="px-4 pt-4 pb-2">
        <button onClick={() => router.back()}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-sl)", color: "var(--color-ink)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center text-center pb-5 px-4 relative"
           style={{ background: "var(--color-navy)" }}>
        <HeroShapes />
        <Avatar name={profile.display_name || ""} photoURL={profile.photo_url} size={64} className="mb-3"
                style={{ border: "3px solid var(--color-orange)" }} />
        <h1 className="text-[18px] font-black text-white tracking-tight">{profile.display_name || "—"}</h1>
        <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {profile.class} · ONE! International School
        </p>
        <div className="flex gap-3 mt-4 w-full">
          {[
            { n: posts.length, l: "Записей" },
            { n: uniqueTrips, l: "Поездки" },
            { n: totalReactions, l: "Реакции" },
          ].map(({ n, l }) => (
            <div key={l} className="flex-1 rounded-[10px] py-2.5 text-center"
                 style={{ background: "rgba(255,255,255,0.08)" }}>
              <p className="text-[18px] font-black text-white leading-none">{n}</p>
              <p className="text-[9px] mt-1 tracking-wide" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
            </div>
          ))}
        </div>
        {isOwnProfile && (
          <Link href="/profile" className="mt-3 rounded-full px-4 py-1.5 text-[11px] font-black"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
            Редактировать профиль
          </Link>
        )}
      </div>

      <div className="flex" style={{ borderBottom: "1px solid var(--color-hr)" }}>
        {["Записи", "Достижения"].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
                  className="flex-1 py-3 text-[11px] font-black tracking-wide transition-colors"
                  style={{
                    color: tab === i ? "var(--color-orange)" : "var(--color-sub)",
                    borderBottom: `2.5px solid ${tab === i ? "var(--color-orange)" : "transparent"}`,
                  }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid grid-cols-2 gap-[3px] p-[3px] mt-1">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}
                  className="relative aspect-square rounded-[10px] overflow-hidden"
                  style={{ background: "var(--color-sl)" }}>
              {post.media_urls?.[0] ? (
                isVideoUrl(post.media_urls[0]) ? (
                  <div className="relative w-full h-full" style={{ background: "var(--color-navy)" }}>
                    <video src={mediaUrl(post.media_urls[0])} className="w-full h-full object-cover" muted preload="metadata" playsInline />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.85)" }}>
                        <svg viewBox="0 0 24 24" fill="var(--color-navy)" className="w-4 h-4 ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={mediaUrl(post.media_urls[0])} alt="" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center p-3">
                  <p className="text-[10px] font-black text-center line-clamp-4" style={{ color: "var(--color-sub)" }}>
                    {post.text}
                  </p>
                </div>
              )}
              {post.trip_name && (
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                     style={{ background: "rgba(19,34,69,0.55)" }}>
                  <p className="text-[9px] font-black text-white truncate">{post.trip_name}</p>
                </div>
              )}
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="col-span-2 py-16 flex flex-col items-center gap-2">
              <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>Записей пока нет</p>
            </div>
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="px-4 py-5">
          <Achievements posts={posts} />
        </div>
      )}

      {currentUser?.email?.toLowerCase() === ADMIN_EMAIL && !isOwnProfile && (
        <div className="px-4 pt-4 pb-2">
          {delError && (
            <p className="text-[12px] font-black text-center rounded-[10px] px-4 py-2.5 mb-2"
               style={{ background: "rgba(198,40,40,0.1)", color: "#c62828" }}>
              {delError}
            </p>
          )}
          {confirmDel ? (
            <div className="rounded-[12px] p-3.5" style={{ background: "rgba(198,40,40,0.06)", border: "1.5px solid rgba(198,40,40,0.25)" }}>
              <p className="text-[12px] font-black mb-1" style={{ color: "#c62828" }}>
                Удалить «{profile.display_name}»?
              </p>
              <p className="text-[11px] mb-3" style={{ color: "var(--color-sub)" }}>
                Аккаунт и все его записи будут удалены навсегда.
              </p>
              <div className="flex gap-2">
                <button onClick={handleDeleteUser} disabled={deleting}
                        className="flex-1 rounded-full py-2.5 text-[12px] font-black text-white disabled:opacity-50"
                        style={{ background: "#c62828" }}>
                  {deleting ? "Удаляем..." : "Да, удалить"}
                </button>
                <button onClick={() => setConfirmDel(false)} disabled={deleting}
                        className="flex-1 rounded-full py-2.5 text-[12px] font-black"
                        style={{ background: "var(--color-sl)", color: "var(--color-sub)" }}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)}
                    className="w-full rounded-full py-3 text-[12px] font-black"
                    style={{ border: "1.5px solid rgba(198,40,40,0.3)", color: "#c62828" }}>
              Удалить участника
            </button>
          )}
        </div>
      )}

      <BottomNav isTeacher={myProfile?.role === "teacher"} />
    </div>
  );
}
