"use client";
import Link from "next/link";
import Avatar from "./Avatar";
import { addReaction } from "@/lib/db";
import { useUser } from "./AuthProvider";
import { useState } from "react";
import Lightbox from "./Lightbox";

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default function PostCard({ post }) {
  const user = useUser();
  const [hearts, setHearts] = useState(post.heart_count || 0);
  const [stars, setStars] = useState(post.star_count || 0);
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  async function handleReact(type, isActive, setActive, setCount) {
    if (!user) return;
    const delta = isActive ? -1 : 1;
    setActive(!isActive);
    setCount((n) => Math.max(0, n + delta));
    await addReaction(post.id, type, delta);
  }

  return (
    <article className="rounded-[20px] mb-3 overflow-hidden" style={{ background: "var(--color-card)", boxShadow: "var(--shadow-sm)" }}>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {post.media_urls?.[0] && (
        <div className="relative h-36 overflow-hidden cursor-zoom-in"
             onClick={() => !post.media_urls[0].includes("video") && setLightbox(post.media_urls[0])}>
          {post.media_urls[0].includes("video") ? (
            <video src={post.media_urls[0]} className="w-full h-full object-cover" muted controls />
          ) : (
            <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
          )}
          {post.trip_name && (
            <span className="absolute top-2.5 left-2.5 text-white text-[10px] font-black rounded-full px-2.5 py-1"
                  style={{ background: "rgba(19,34,69,0.8)" }}>
              {post.trip_name}
            </span>
          )}
        </div>
      )}

      <div className="px-3.5 py-3">
        {!post.media_urls?.[0] && post.trip_name && (
          <p className="text-[10px] font-black tracking-wide uppercase mb-2" style={{ color: "var(--color-orange)" }}>
            {post.trip_name}
          </p>
        )}

        <Link href={`/user/${post.author_id}`} className="flex items-center gap-2 mb-2">
          <Avatar name={post.author_name} photoURL={post.author_photo} size={28} />
          <div>
            <p className="text-[13px] font-black leading-tight" style={{ color: "var(--color-title)" }}>
              {post.author_name}
            </p>
            <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>
              {post.author_class} · {formatDate(post.created_at)}
            </p>
          </div>
        </Link>

        <p className="text-[13px] leading-relaxed mb-2.5 line-clamp-3" style={{ color: "var(--color-ink)" }}>
          {post.text}
        </p>

        <div className="flex items-center gap-1.5">
          <button onClick={() => handleReact("heart", liked, setLiked, setHearts)}
                  className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
                  style={{ background: liked ? "rgba(237,118,21,.1)" : "var(--color-sl)", color: liked ? "var(--color-orange)" : "var(--color-sub)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {hearts}
          </button>

          <button onClick={() => handleReact("star", starred, setStarred, setStars)}
                  className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
                  style={{ background: starred ? "rgba(237,118,21,.1)" : "var(--color-sl)", color: starred ? "var(--color-orange)" : "var(--color-sub)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {stars}
          </button>

          <Link href={`/post/${post.id}`} className="ml-auto text-[11px] font-black" style={{ color: "var(--color-orange)" }}>
            Читать далее
          </Link>
        </div>
      </div>
    </article>
  );
}
