"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/components/AuthProvider";
import { getUser, getUserPosts, updateProfile } from "@/lib/db";
import { uploadAvatar } from "@/lib/storage";
import { useRef } from "react";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState(0);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarRef = useRef();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.id).then(setProfile);
    getUserPosts(user.id).then(setPosts);
  }, [user, router]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarLoading(true);
    try {
      const url = await uploadAvatar(file, user.id);
      await updateProfile(user.id, { photo_url: url });
      setProfile((p) => ({ ...p, photo_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setAvatarLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const totalReactions = posts.reduce((s, p) => s + (p.heart_count || 0) + (p.star_count || 0), 0);

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--color-wh)" }}>
      <div className="flex flex-col items-center text-center pb-5 pt-6 px-4"
           style={{ background: "var(--color-navy)" }}>
        <div className="relative mb-3 cursor-pointer" onClick={() => avatarRef.current?.click()}>
          <Avatar
            name={profile?.display_name || ""}
            photoURL={profile?.photo_url}
            size={64}
            style={{ border: "3px solid var(--color-orange)" }}
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
               style={{ background: "var(--color-orange)" }}>
            {avatarLoading ? (
              <div className="w-2.5 h-2.5 border border-white rounded-full animate-spin"
                   style={{ borderTopColor: "transparent" }} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-2.5 h-2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <h1 className="text-[18px] font-black text-white tracking-tight leading-tight">
          {profile?.display_name || "..."}
        </h1>
        <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {profile?.class} · ONE! International School
        </p>
        <div className="flex gap-3 mt-4 w-full">
          {[
            { n: posts.length, l: "Записей" },
            { n: profile?.trips_count || 0, l: "Поездки" },
            { n: totalReactions, l: "Реакции" },
          ].map(({ n, l }) => (
            <div key={l} className="flex-1 rounded-[10px] py-2.5 text-center"
                 style={{ background: "rgba(255,255,255,0.08)" }}>
              <p className="text-[18px] font-black text-white leading-none">{n}</p>
              <p className="text-[9px] mt-1 tracking-wide" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: "1px solid var(--color-hr)" }}>
        {["Записи", "О себе"].map((t, i) => (
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
        <div className="grid grid-cols-2 gap-[3px] p-[3px]">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}
                  className="relative aspect-square rounded-[10px] overflow-hidden"
                  style={{ background: "var(--color-sl)" }}>
              {post.media_urls?.[0] ? (
                <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
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
              <Link href="/create" className="text-[12px] font-black" style={{ color: "var(--color-orange)" }}>
                Добавить первую запись
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="px-4 py-5 flex flex-col gap-3">
          <div className="rounded-[12px] p-4" style={{ background: "var(--color-mint)" }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "var(--color-navy-700)" }}>Класс</p>
            <p className="text-[15px] font-black" style={{ color: "var(--color-navy)" }}>
              {profile?.class || "—"}
            </p>
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--color-sl)" }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "var(--color-sub)" }}>Email</p>
            <p className="text-[13px]" style={{ color: "var(--color-ink)" }}>{user?.email || "—"}</p>
          </div>
          <button onClick={logout}
                  className="w-full rounded-full py-3 text-[13px] font-black mt-2"
                  style={{ border: "1.5px solid var(--color-hr)", color: "var(--color-sub)" }}>
            Выйти из аккаунта
          </button>
        </div>
      )}

      <BottomNav isTeacher={profile?.role === "teacher"} />
    </div>
  );
}
