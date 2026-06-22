"use client";
import Link from "next/link";
import Avatar from "./Avatar";
import { addReaction, deletePost } from "@/lib/db";
import { useUser } from "./AuthProvider";
import { useState, useEffect } from "react";
import Lightbox from "./Lightbox";
import MediaGallery from "./MediaGallery";
import { weatherEmoji, weatherLabel } from "@/lib/diary";

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

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem(`rxn_${user.id}_${post.id}`) || "{}");
    if (saved.heart) setLiked(true);
    if (saved.star) setStarred(true);
  }, [user?.id, post.id]);
  const [lightbox, setLightbox] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [popHeart, setPopHeart] = useState(false);
  const [popStar, setPopStar] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    await deletePost(post.id);
    setDeleted(true);
  }

  async function handleReact(type, isActive, setActive, setCount) {
    if (!user) return;
    const next = !isActive;
    const delta = next ? 1 : -1;
    setActive(next);
    setCount((n) => Math.max(0, n + delta));
    const key = `rxn_${user.id}_${post.id}`;
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    saved[type] = next;
    localStorage.setItem(key, JSON.stringify(saved));
    await addReaction(post.id, type, delta);
  }

  if (deleted) return null;

  const isOwner = user?.id === post.author_id;
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <article className="rounded-[20px] mb-3 overflow-hidden" style={{ background: "var(--color-card)", boxShadow: "var(--shadow-sm)" }}>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {post.media_urls?.length > 0 && (
        <div className="relative">
          <MediaGallery urls={post.media_urls} height={144} onImageClick={setLightbox} />
          {post.trip_name && (
            <span className="absolute top-2.5 left-2.5 text-white text-[10px] font-black rounded-full px-2.5 py-1 pointer-events-none"
                  style={{ background: "rgba(19,34,69,0.8)" }}>
              {post.trip_name}
            </span>
          )}
        </div>
      )}

      <div className="px-3.5 py-3">
        {!post.media_urls?.length && post.trip_name && (
          <p className="text-[10px] font-black tracking-wide uppercase mb-2" style={{ color: "var(--color-orange)" }}>
            {post.trip_name}
          </p>
        )}

        <div className="flex items-center justify-between mb-2">
        <Link href={`/user/${post.author_id}`} className="flex items-center gap-2 flex-1 min-w-0">
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
        {isOwner && (
          confirming ? (
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <button onClick={handleDelete}
                      className="text-[10px] font-black rounded-full px-2.5 py-1"
                      style={{ background: "rgba(198,40,40,0.1)", color: "#c62828" }}>
                Удалить
              </button>
              <button onClick={() => setConfirming(false)}
                      className="text-[10px] font-black rounded-full px-2.5 py-1"
                      style={{ background: "var(--color-sl)", color: "var(--color-sub)" }}>
                Отмена
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)}
                    className="flex-shrink-0 ml-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ color: "var(--color-sub)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )
        )}
        </div>

        {(post.location || post.weather) && (
          <div className="flex items-center gap-2.5 mb-2 text-[11px] font-black flex-wrap" style={{ color: "var(--color-sub)" }}>
            {post.location && (
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth={2.5} className="w-3 h-3">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {post.location}
              </span>
            )}
            {post.weather && <span>{weatherEmoji(post.weather)} {weatherLabel(post.weather)}</span>}
          </div>
        )}

        <p className="text-[13px] leading-relaxed mb-2.5 line-clamp-3" style={{ color: "var(--color-ink)" }}>
          {post.text}
        </p>

        <div className="flex items-center gap-1.5">
          <button onClick={() => { handleReact("heart", liked, setLiked, setHearts); setPopHeart(true); setTimeout(() => setPopHeart(false), 250); }}
                  className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
                  style={{ background: liked ? "rgba(237,118,21,.1)" : "var(--color-sl)", color: liked ? "var(--color-orange)" : "var(--color-sub)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                 className={`w-3 h-3${popHeart ? " react-pop" : ""}`}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {hearts}
          </button>

          <button onClick={() => { handleReact("star", starred, setStarred, setStars); setPopStar(true); setTimeout(() => setPopStar(false), 250); }}
                  className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
                  style={{ background: starred ? "rgba(237,118,21,.1)" : "var(--color-sl)", color: starred ? "var(--color-orange)" : "var(--color-sub)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                 className={`w-3 h-3${popStar ? " react-pop" : ""}`}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {stars}
          </button>

          <Link href={`/post/${post.id}#comments`}
                className="flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1.5"
                style={{ background: "var(--color-sl)", color: "var(--color-sub)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {commentCount}
          </Link>

          <Link href={`/post/${post.id}`} className="ml-auto text-[11px] font-black" style={{ color: "var(--color-orange)" }}>
            Читать далее
          </Link>
        </div>
      </div>
    </article>
  );
}
