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

  const multiple = urls.length > 1;

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
          <span
            className="absolute top-2.5 right-2.5 text-white text-[10px] font-black rounded-full px-2 py-0.5 pointer-events-none"
            style={{ background: "rgba(19,34,69,0.7)" }}
          >
            {active + 1}/{urls.length}
          </span>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
            {urls.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === active ? 16 : 5,
                  height: 5,
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
