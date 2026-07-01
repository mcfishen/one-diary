"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getUser, subscribeToPending, updatePostStatus, bulkUpdateStatus, toggleFeatured } from "@/lib/db";
import Avatar from "@/components/Avatar";
import BottomNav from "@/components/BottomNav";

const FEEDBACK_CHIPS = [
  "Слишком коротко, добавь деталей",
  "Нужно фото или видео",
  "Проверь орфографию",
  "Текст не по теме поездки",
];

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) +
    " · " + new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function ModerationPage() {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("pending");
  const [processing, setProcessing] = useState({});
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.id).then((p) => {
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
    setPosts((list) =>
      status === "rejected"
        ? list.filter((p) => p.id !== postId)
        : list.map((p) => (p.id === postId ? { ...p, status } : p))
    );
    setProcessing((p) => ({ ...p, [postId]: false }));
  }

  async function confirmReject(postId) {
    setProcessing((p) => ({ ...p, [postId]: true }));
    await updatePostStatus(postId, "rejected", rejectNote || null);
    setPosts((list) => list.filter((p) => p.id !== postId));
    setProcessing((p) => ({ ...p, [postId]: false }));
    setRejectingId(null);
    setRejectNote("");
  }

  async function handleToggleFeatured(postId, value) {
    await toggleFeatured(postId, value);
    setPosts((list) => list.map((p) => (p.id === postId ? { ...p, featured: value } : p)));
  }

  function toggleSelect(id) {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleBulkApprove() {
    const ids = [...selectedIds];
    await bulkUpdateStatus(ids, "published");
    setPosts((list) => list.map((p) => (ids.includes(p.id) ? { ...p, status: "published" } : p)));
    setSelectedIds(new Set());
  }

  async function handleBulkReject() {
    const ids = [...selectedIds];
    await bulkUpdateStatus(ids, "rejected");
    setPosts((list) => list.filter((p) => !ids.includes(p.id)));
    setSelectedIds(new Set());
  }

  const filtered = tab === "pending"
    ? posts.filter((p) => p.status === "pending")
    : posts.filter((p) => p.status === "published");

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--color-wh)" }}>
      <div className="px-4 pt-5 pb-4 flex items-center justify-between" style={{ background: "var(--color-navy)" }}>
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Панель учителя
          </p>
          <h1 className="text-[18px] font-black text-white tracking-tight">Проверка записей</h1>
        </div>
        {posts.filter((p) => p.status === "pending").length > 0 && (
          <span className="text-white text-[11px] font-black rounded-full px-3 py-1.5" style={{ background: "var(--color-orange)" }}>
            {posts.filter((p) => p.status === "pending").length} ожидает
          </span>
        )}
      </div>

      <div className="flex" style={{ borderBottom: "1px solid var(--color-hr)" }}>
        {[{ key: "pending", label: `На проверке (${posts.filter(p => p.status === "pending").length})` },
          { key: "published", label: "Опубликовано" }].map(({ key, label }) => (
          <button key={key} onClick={() => { setTab(key); setSelectMode(false); setSelectedIds(new Set()); }}
                  className="flex-1 py-3 text-[11px] font-black tracking-wide transition-colors"
                  style={{
                    color: tab === key ? "var(--color-orange)" : "var(--color-sub)",
                    borderBottom: `2.5px solid ${tab === key ? "var(--color-orange)" : "transparent"}`,
                  }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "pending" && filtered.length > 0 && (
        <div className="px-4 pt-3 flex items-center justify-between">
          <button onClick={() => { setSelectMode((s) => !s); setSelectedIds(new Set()); }}
                  className="text-[11px] font-black rounded-full px-3 py-1.5"
                  style={{ background: selectMode ? "var(--color-navy)" : "var(--color-sl)", color: selectMode ? "#fff" : "var(--color-sub)" }}>
            {selectMode ? "Отменить выбор" : "Выбрать несколько"}
          </button>
          {selectMode && (
            <span className="text-[11px] font-black" style={{ color: "var(--color-sub)" }}>
              {selectedIds.size} выбрано
            </span>
          )}
        </div>
      )}

      {selectMode && selectedIds.size > 0 && (
        <div className="mx-4 mt-2 rounded-[12px] p-2.5 flex items-center justify-between" style={{ background: "var(--color-navy)" }}>
          <span className="text-[11px] font-black text-white pl-1.5">{selectedIds.size} выбрано</span>
          <div className="flex gap-2">
            <button onClick={handleBulkApprove}
                    className="text-[11px] font-black rounded-full px-3 py-1.5"
                    style={{ background: "rgba(46,125,50,0.9)", color: "#fff" }}>
              Опубликовать
            </button>
            <button onClick={handleBulkReject}
                    className="text-[11px] font-black rounded-full px-3 py-1.5"
                    style={{ background: "rgba(198,40,40,0.9)", color: "#fff" }}>
              Отклонить
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-[13px] font-black" style={{ color: "var(--color-sub)" }}>
              {tab === "pending" ? "Всё проверено" : "Нет опубликованных записей"}
            </p>
          </div>
        )}

        {filtered.map((post) => (
          <article key={post.id} className="rounded-[20px] mb-3 overflow-hidden" style={{ background: "var(--color-card)", boxShadow: "var(--shadow-sm)" }}>
            <div className="px-3.5 pt-3 pb-2">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {selectMode && tab === "pending" && (
                    <input type="checkbox" checked={selectedIds.has(post.id)} onChange={() => toggleSelect(post.id)}
                           className="w-4 h-4 flex-shrink-0" style={{ accentColor: "var(--color-orange)" }} />
                  )}
                  <span className="text-[10px] font-black tracking-wide uppercase truncate" style={{ color: "var(--color-orange)" }}>
                    {post.trip_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tab === "published" && (
                    <button onClick={() => handleToggleFeatured(post.id, !post.featured)}
                            className="flex items-center gap-1 text-[10px] font-black rounded-full px-2.5 py-1"
                            style={{ background: post.featured ? "rgba(237,118,21,0.12)" : "var(--color-sl)", color: post.featured ? "var(--color-orange)" : "var(--color-sub)" }}>
                      <svg viewBox="0 0 24 24" fill={post.featured ? "var(--color-orange)" : "none"} stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {post.featured ? "Лучшая" : "Отметить"}
                    </button>
                  )}
                  <span className="text-[10px]" style={{ color: "var(--color-sub)" }}>
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={post.author_name} photoURL={post.author_photo} size={28} />
                <div>
                  <p className="text-[12px] font-black" style={{ color: "var(--color-title)" }}>{post.author_name}</p>
                  <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>{post.author_class}</p>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: "var(--color-ink)" }}>
                {post.text}
              </p>
            </div>

            {post.status === "pending" && (
              <div style={{ borderTop: "1px solid var(--color-hr)" }}>
                {rejectingId === post.id ? (
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--color-sub)" }}>
                      Причина отклонения
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FEEDBACK_CHIPS.map((chip) => (
                        <button key={chip} type="button" onClick={() => setRejectNote(chip)}
                                className="text-[10px] font-black rounded-full px-2.5 py-1 transition-colors"
                                style={{
                                  border: `1.5px solid ${rejectNote === chip ? "#c62828" : "var(--color-hr)"}`,
                                  background: rejectNote === chip ? "rgba(198,40,40,0.08)" : "var(--color-card)",
                                  color: rejectNote === chip ? "#c62828" : "var(--color-sub)",
                                }}>
                          {chip}
                        </button>
                      ))}
                    </div>
                    <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={2}
                              placeholder="Свой комментарий (ученик его увидит)"
                              className="w-full rounded-[10px] px-3 py-2 text-[12px] outline-none resize-none"
                              style={{ border: "1.5px solid var(--color-hr)", background: "var(--color-card)", color: "var(--color-ink)" }} />
                    <div className="flex gap-2">
                      <button onClick={() => confirmReject(post.id)} disabled={processing[post.id]}
                              className="flex-1 rounded-full py-2 text-[12px] font-black text-white transition-opacity disabled:opacity-50"
                              style={{ background: "#c62828" }}>
                        Отклонить
                      </button>
                      <button onClick={() => { setRejectingId(null); setRejectNote(""); }}
                              className="flex-1 rounded-full py-2 text-[12px] font-black"
                              style={{ background: "var(--color-sl)", color: "var(--color-sub)" }}>
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 px-3.5 py-2.5">
                    <button onClick={() => handleAction(post.id, "published")} disabled={processing[post.id]}
                            className="flex-1 rounded-full py-2 text-[12px] font-black transition-opacity disabled:opacity-50"
                            style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}>
                      Опубликовать
                    </button>
                    <button onClick={() => { setRejectingId(post.id); setRejectNote(""); }} disabled={processing[post.id]}
                            className="flex-1 rounded-full py-2 text-[12px] font-black transition-opacity disabled:opacity-50"
                            style={{ background: "rgba(198,40,40,0.08)", color: "#c62828" }}>
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      <BottomNav isTeacher={true} />
    </div>
  );
}
