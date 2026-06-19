"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/components/AuthProvider";
import { getUser, getUserPosts } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.uid).then(setProfile);
    getUserPosts(user.uid).then(setPosts);
  }, [user, router]);

  async function logout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--color-wh)" }}>
      {/* Hero */}
      <div className="flex flex-col items-center text-center pb-5 pt-6 px-4"
           style={{ background: "var(--color-navy)" }}>
        <Avatar
          name={profile?.displayName || ""}
          photoURL={profile?.photoURL}
          size={64}
          className="mb-3"
          style={{ border: "3px solid var(--color-orange)" }}
        />
        <h1 className="text-[18px] font-black text-white tracking-tight leading-tight">
          {profile?.displayName || "..."}
        </h1>
        <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          {profile?.class} · ONE! International School
        </p>
        <div className="flex gap-3 mt-4 w-full">
          {[
            { n: posts.length, l: "Записей" },
            { n: profile?.tripsCount || 0, l: "Поездки" },
            { n: posts.reduce((s, p) => s + (p.reactions?.heart || 0) + (p.reactions?.star || 0), 0), l: "Реакции" },
          ].map(({ n, l }) => (
            <div key={l} className="flex-1 rounded-[10px] py-2.5 text-center"
                 style={{ background: "rgba(255,255,255,0.08)" }}>
              <p className="text-[18px] font-black text-white leading-none">{n}</p>
              <p className="text-[9px] mt-1 tracking-wide" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
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
              {post.mediaUrls?.[0] ? (
                <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-3">
                  <p className="text-[10px] font-black text-center line-clamp-4"
                     style={{ color: "var(--color-sub)" }}>
                    {post.text}
                  </p>
                </div>
              )}
              {post.tripName && (
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                     style={{ background: "rgba(19,34,69,0.55)" }}>
                  <p className="text-[9px] font-black text-white truncate">{post.tripName}</p>
                </div>
              )}
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="col-span-2 py-16 flex flex-col items-center gap-2">
              <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>Записей пока нет</p>
              <Link href="/create" className="text-[12px] font-black"
                    style={{ color: "var(--color-orange)" }}>
                Добавить первую запись
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="px-4 py-5 flex flex-col gap-3">
          <div className="rounded-[12px] p-4" style={{ background: "var(--color-mint)" }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-1"
               style={{ color: "var(--color-navy-700)" }}>Класс</p>
            <p className="text-[15px] font-black" style={{ color: "var(--color-navy)" }}>
              {profile?.class || "—"}
            </p>
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--color-sl)" }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-1"
               style={{ color: "var(--color-sub)" }}>Email</p>
            <p className="text-[13px]" style={{ color: "var(--color-ink)" }}>
              {user?.email || "—"}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-full py-3 text-[13px] font-black mt-2"
            style={{ border: "1.5px solid var(--color-hr)", color: "var(--color-sub)" }}
          >
            Выйти из аккаунта
          </button>
        </div>
      )}

      <BottomNav isTeacher={profile?.role === "teacher"} />
    </div>
  );
}
