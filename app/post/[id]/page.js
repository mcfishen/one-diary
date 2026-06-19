"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getPost, addReaction, addComment, getUser } from "@/lib/db";
import Avatar from "@/components/Avatar";
import Link from "next/link";

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function PostPage({ params }) {
  const { id } = use(params);
  const user = useUser();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [profile, setProfile] = useState(null);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPost(id).then(setPost);
  }, [id]);

  useEffect(() => {
    if (user) getUser(user.uid).then(setProfile);
  }, [user]);

  async function handleReact(type, isActive, setActive) {
    if (!user) return;
    setActive(!isActive);
    await addReaction(id, type, isActive ? -1 : 1);
    setPost((p) => ({
      ...p,
      reactions: { ...p.reactions, [type]: Math.max(0, (p.reactions?.[type] || 0) + (isActive ? -1 : 1)) },
    }));
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim() || !user || !profile) return;
    const c = { text: comment, authorName: profile.displayName, authorId: user.uid };
    await addComment(id, c);
    setPost((p) => ({ ...p, comments: [...(p.comments || []), c] }));
    setComment("");
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
             style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-wh)" }}>
      {/* Back button */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Назад"
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-sl)", color: "var(--color-navy)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p className="text-[11px] font-black tracking-wide" style={{ color: "var(--color-sub)" }}>
          {post.tripName}
        </p>
      </div>

      {/* Media */}
      {post.mediaUrls?.[0] && (
        <div className="w-full h-52 overflow-hidden">
          <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-4 py-4">
        {/* Trip chip */}
        <p className="text-[10px] font-black tracking-widest uppercase mb-2"
           style={{ color: "var(--color-orange)" }}>
          {post.tripName}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2.5 mb-4">
          <Avatar name={post.authorName} photoURL={post.authorPhoto} size={32} />
          <div>
            <p className="text-[13px] font-black leading-tight" style={{ color: "var(--color-navy)" }}>
              {post.authorName}
            </p>
            <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>
              {post.authorClass} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Text */}
        <p className="text-[14px] leading-[1.65] mb-4" style={{ color: "var(--color-ink)" }}>
          {post.text}
        </p>

        {/* Mood */}
        {post.mood && (
          <span className="inline-block text-[11px] font-black rounded-full px-3 py-1.5 mb-4"
                style={{ background: "rgba(237,118,21,0.1)", color: "var(--color-orange)" }}>
            Настроение: {post.mood}
          </span>
        )}

        {/* Reactions */}
        <div className="flex gap-2 mb-6">
          {[
            { type: "heart", isActive: liked, setActive: setLiked, icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
            { type: "star", isActive: starred, setActive: setStarred, icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
          ].map(({ type, isActive, setActive, icon }) => (
            <button
              key={type}
              onClick={() => handleReact(type, isActive, setActive)}
              className="flex items-center gap-1.5 text-[12px] font-black rounded-full px-3 py-2"
              style={{
                background: isActive ? "rgba(237,118,21,.1)" : "var(--color-sl)",
                color: isActive ? "var(--color-orange)" : "var(--color-sub)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                {icon}
              </svg>
              {post.reactions?.[type] || 0}
            </button>
          ))}
        </div>

        {/* Comments */}
        <div style={{ borderTop: "1px solid var(--color-hr)" }} className="pt-4">
          <p className="text-[10px] font-black tracking-widest uppercase mb-3"
             style={{ color: "var(--color-navy)" }}>Комментарии</p>

          {(post.comments || []).map((c, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <Avatar name={c.authorName || ""} size={26} />
              <div className="rounded-[10px] rounded-tl-none px-3 py-2 flex-1 text-[12px] leading-relaxed"
                   style={{ background: "var(--color-sl)", color: "var(--color-ink)" }}>
                <span className="font-black" style={{ color: "var(--color-navy)" }}>{c.authorName} </span>
                {c.text}
              </div>
            </div>
          ))}

          {user && (
            <form onSubmit={handleComment} className="flex gap-2 mt-3">
              <Avatar name={profile?.displayName || ""} size={28} />
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="flex-1 rounded-full px-3.5 py-2 text-[12px] outline-none"
                style={{ background: "var(--color-sl)", border: "none", color: "var(--color-ink)" }}
              />
              <button type="submit" disabled={!comment.trim()}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                      style={{ background: "var(--color-orange)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3.5 h-3.5">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
