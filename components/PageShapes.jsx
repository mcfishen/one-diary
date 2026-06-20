export default function PageShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Large blob — top right */}
      <div className="absolute" style={{
        width: 340, height: 340, top: -130, right: -110,
        background: "var(--color-orange)", opacity: 0.045,
        borderRadius: "62% 38% 46% 54% / 60% 44% 56% 40%",
      }} />
      {/* Medium blob — bottom left */}
      <div className="absolute" style={{
        width: 220, height: 220, bottom: 180, left: -90,
        background: "var(--color-mint)", opacity: 0.07,
        borderRadius: "40% 60% 55% 45% / 37% 45% 55% 63%",
      }} />
      {/* Small circle — mid right */}
      <div className="absolute" style={{
        width: 72, height: 72, top: "42%", right: -20,
        background: "var(--color-orange)", opacity: 0.05,
        borderRadius: "50%",
      }} />
      {/* Tiny dot */}
      <div className="absolute" style={{
        width: 16, height: 16, top: "28%", left: 28,
        background: "var(--color-orange)", opacity: 0.12,
        borderRadius: "50%",
      }} />
      {/* Faint ring — center left */}
      <div className="absolute" style={{
        width: 100, height: 100, top: "60%", left: -30,
        border: "2px solid var(--color-mint)", opacity: 0.12,
        borderRadius: "50%",
      }} />
    </div>
  );
}
