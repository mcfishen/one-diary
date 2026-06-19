"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getUser, subscribeToPending, updatePostStatus } from "@/lib/db";
import Avatar from "@/components/Avatar";
import BottomNav from "@/components/BottomNav";

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function ModerationPage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("pending");
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.uid).then((p) => {
      if (p?.role !== "teacher") { router.replace("/feed"); return; }
      setProfile(p);
    });
  }, [user, router]);

  useEffect(() => {
    if (!profile) return;
    return subscribeToPending(setPosts);
  }, [profile]);

  async function handleAction(postId, status) {
    setProcessing((p) => ({ ...p, [postId]: true }));
    await updatePostStatus(postId, status);
    setProcessing((p) => ({ ...p, [postId]: false }));
  }

  const filtered = tab === "pending"
    ? posts.filter((p) => p.status === "pending")
    : posts.filter((p) => p.status === "published");

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--color-wh)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between"
           style={{ background: "var(--color-navy)" }}>
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-1"
             style={{ color: "rgba(255,255,255,0.4)" }}>Панель учителя</p>
          <h1 className="text-[18px] font-black text-white tracking-tight">Проверка записей</h1>
        </div>
        {posts.filter((p) => p.status === "pending").length > 0 && (
          <span className="text-white text-[11px] font-black rounded-full px-3 py-1.5"
                style={{ background: "var(--color-orange)" }}>
            {posts.filter((p) => p.status === "pending").length} ожидает
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--color-hr)" }}>
        {[{ key: "pending", label: `На проверке (${posts.filter(p=>p.status==="pending").length})` },
          { key: "published", label: "Опубликовано" }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
                  className="flex-1 py-3 text-[11px] font-black tracking-wide transition-colors"
                  style={{
                    color: tab === key ? "var(--color-orange)" : "var(--color-sub)",
                    borderBottom: `2.5px solid ${tab === key ? "var(--color-orange)" : "transparent"}`,
                  }}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>
              {tab === "pending" ? "Всё проверено" : "Нет опубликованных записей"}
            </p>
          </div>
        )}

        {filtered.map((post) => (
          <article key={post.id} className="bg-white rounded-[20px] mb-3 overflow-hidden"
                   style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black tracking-wide uppercase"
                      style={{ color: "var(--color-orange)" }}>
                  {post.tripName}
                </span>
                <span className="text-[10px]" style={{ color: "var(--color-sub)" }}>
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={post.authorName} photoURL={post.authorPhoto} size={28} />
                <div>
                  <p className="text-[12px] font-black" style={{ color: "var(--color-navy)" }}>
                    {post.authorName}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>{post.authorClass}</p>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: "var(--color-ink)" }}>
                {post.text}
              </p>
            </div>

            {post.status === "pending" && (
              <div className="flex gap-2 px-3.5 py-2.5" style={{ borderTop: "1px solid var(--color-hr)" }}>
                <button
                  onClick={() => handleAction(post.id, "published")}
                  disabled={processing[post.id]}
                  className="flex-1 rounded-full py-2 text-[12px] font-black transition-opacity disabled:opacity-50"
                  style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}
                >
                  Опубликовать
                </button>
                <button
                  onClick={() => handleAction(post.id, "rejected")}
                  disabled={processing[post.id]}
                  className="flex-1 rounded-full py-2 text-[12px] font-black transition-opacity disabled:opacity-50"
                  style={{ background: "rgba(198,40,40,0.08)", color: "#c62828" }}
                >
                  Отклонить
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <BottomNav isTeacher={true} />
    </div>
  );
}
