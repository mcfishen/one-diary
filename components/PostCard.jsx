"use client";
import Link from "next/link";
import Avatar from "./Avatar";
import { addReaction } from "@/lib/db";
import { useUser } from "./AuthProvider";
import { useState } from "react";

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default function PostCard({ post }) {
  const user = useUser();
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);

  async function handleReact(type, isActive, setActive) {
    if (!user) return;
    const delta = isActive ? -1 : 1;
    setActive(!isActive);
    setLocalReactions((r) => ({ ...r, [type]: Math.max(0, (r[type] || 0) + delta) }));
    await addReaction(post.id, type, delta);
  }

  return (
    <article
      className="bg-white rounded-[20px] mb-3 overflow-hidden"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {post.mediaUrls?.[0] && (
        <Link href={`/post/${post.id}`}>
          <div className="relative h-36 overflow-hidden">
            {post.mediaUrls[0].includes("video") ? (
              <video src={post.mediaUrls[0]} className="w-full h-full object-cover" muted />
            ) : (
              <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
            )}
            {post.tripName && (
              <span
                className="absolute top-2.5 left-2.5 text-white text-[10px] font-black rounded-full px-2.5 py-1"
                style={{ background: "rgba(19,34,69,0.8)" }}
              >
                {post.tripName}
              </span>
            )}
          </div>
        </Link>
      )}

      <div className="px-3.5 py-3">
        {!post.mediaUrls?.[0] && post.tripName && (
          <p className="text-[10px] font-black tracking-wide uppercase mb-2"
             style={{ color: "var(--color-orange)" }}>
            {post.tripName}
          </p>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Avatar name={post.authorName} photoURL={post.authorPhoto} size={28} />
          <div>
            <p className="text-[13px] font-black leading-tight" style={{ color: "var(--color-navy)" }}>
              {post.authorName}
            </p>
            <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>
              {post.authorClass} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed mb-2.5 line-clamp-3" style={{ color: "var(--color-ink)" }}>
          {post.text}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleReact("heart", liked, setLiked)}
            className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
            style={{
              background: liked ? "rgba(237,118,21,.1)" : "var(--color-sl)",
              color: liked ? "var(--color-orange)" : "var(--color-sub)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {localReactions.heart || 0}
          </button>

          <button
            onClick={() => handleReact("star", starred, setStarred)}
            className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
            style={{
              background: starred ? "rgba(237,118,21,.1)" : "var(--color-sl)",
              color: starred ? "var(--color-orange)" : "var(--color-sub)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {localReactions.star || 0}
          </button>

          <Link
            href={`/post/${post.id}`}
            className="ml-auto text-[11px] font-black"
            style={{ color: "var(--color-orange)" }}
          >
            Читать далее
          </Link>
        </div>
      </div>
    </article>
  );
}
