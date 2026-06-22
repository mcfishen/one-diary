import { mediaUrl } from "@/lib/diary";

export default function Avatar({ name = "", photoURL, size = 32, className = "" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    { bg: "var(--color-mint)", color: "var(--color-navy)" },
    { bg: "#E8F5E9", color: "#2E7D32" },
    { bg: "#E3F2FD", color: "#1565C0" },
    { bg: "#FFF3E0", color: "#E65100" },
    { bg: "#F3E5F5", color: "#6A1B9A" },
  ];
  const c = colors[(name.charCodeAt(0) || 0) % colors.length];

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-black overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: photoURL ? "transparent" : c.bg,
        color: c.color,
      }}
    >
      {photoURL ? (
        <img src={mediaUrl(photoURL)} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
