"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({ src, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal((
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.96)" }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={src}
        alt=""
        className="object-contain rounded-[4px]"
        style={{ maxHeight: "88vh", maxWidth: "92vw" }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  ), document.body);
}
