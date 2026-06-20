export default function HeroShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orange blob — top right */}
      <div className="absolute" style={{
        width: 200, height: 200, top: -60, right: -60,
        background: "var(--color-orange)", opacity: 0.13,
        borderRadius: "67% 33% 47% 53% / 37% 20% 80% 63%",
      }} />
      {/* Mint blob — bottom left */}
      <div className="absolute" style={{
        width: 140, height: 140, bottom: -40, left: -50,
        background: "var(--color-mint)", opacity: 0.1,
        borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
      }} />
      {/* Small orange dot */}
      <div className="absolute" style={{
        width: 44, height: 44, top: "18%", right: 24,
        background: "rgba(237,118,21,0.2)", borderRadius: "50%",
      }} />
      {/* Tiny white circle */}
      <div className="absolute" style={{
        width: 20, height: 20, bottom: "30%", left: 36,
        background: "rgba(255,255,255,0.08)", borderRadius: "50%",
      }} />
      {/* Ring */}
      <div className="absolute" style={{
        width: 80, height: 80, top: "55%", right: -20,
        border: "1.5px solid rgba(255,255,255,0.07)",
        borderRadius: "50%",
      }} />
    </div>
  );
}
