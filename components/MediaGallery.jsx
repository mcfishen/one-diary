"use client";
import { useState, useRef } from "react";
import { isVideoUrl } from "@/lib/diary";

export default function MediaGallery({ urls = [], height = 144, onImageClick }) {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  if (!urls.length) return null;

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i) {
    const el = ref.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(urls.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setActive(clamped);
  }

  const multiple = urls.length > 1;

  const ArrowBtn = ({ side, onClick, disabled }) => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      aria-label={side === "left" ? "Предыдущее фото" : "Следующее фото"}
      className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-opacity disabled:opacity-0"
      style={{ [side]: 8, background: "rgba(19,34,69,0.55)", backdropFilter: "blur(4px)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-4 h-4">
        {side === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full overflow-x-auto scrollbar-none"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {urls.map((url, i) => (
          <div key={i} className="flex-shrink-0 w-full h-full" style={{ scrollSnapAlign: "center" }}>
            {isVideoUrl(url) ? (
              <video src={url} className="w-full h-full object-cover" controls playsInline muted />
            ) : (
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => onImageClick?.(url)}
              />
            )}
          </div>
        ))}
      </div>

      {multiple && (
        <>
          <ArrowBtn side="left" onClick={() => goTo(active - 1)} disabled={active === 0} />
          <ArrowBtn side="right" onClick={() => goTo(active + 1)} disabled={active === urls.length - 1} />

          <span
            className="absolute top-2.5 right-2.5 text-white text-[10px] font-black rounded-full px-2 py-0.5 pointer-events-none"
            style={{ background: "rgba(19,34,69,0.7)" }}
          >
            {active + 1}/{urls.length}
          </span>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                aria-label={`Фото ${i + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === active ? 16 : 6,
                  height: 6,
                  background: i === active ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
