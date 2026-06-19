"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/components/AuthProvider";
import Image from "next/image";

function BgShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute" style={{ width: 260, height: 260, top: -70, right: -70, background: "var(--color-orange)", opacity: 0.15, borderRadius: "67% 33% 47% 53% / 37% 20% 80% 63%" }} />
      <div className="absolute" style={{ width: 180, height: 180, bottom: 160, left: -60, background: "var(--color-mint)", opacity: 0.18, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }} />
      <div className="absolute" style={{ width: 90, height: 90, top: "38%", left: 12, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
      <div className="absolute" style={{ width: 52, height: 52, top: "22%", right: 20, background: "rgba(237,118,21,0.22)", borderRadius: "50%" }} />
      <div className="absolute" style={{ width: 130, height: 130, bottom: 80, right: -40, background: "rgba(255,255,255,0.05)", borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%" }} />
      <div className="absolute" style={{ width: 18, height: 18, top: "62%", left: 44, background: "rgba(214,245,238,0.35)", borderRadius: "50%" }} />
      <div className="absolute" style={{ width: 12, height: 12, top: "48%", right: 60, background: "rgba(237,118,21,0.45)", borderRadius: "50%" }} />
      <div className="absolute" style={{ width: 36, height: 36, top: "15%", left: "45%", background: "rgba(214,245,238,0.12)", borderRadius: "50%" }} />
    </div>
  );
}

export default function LoginPage() {
  const user = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/feed");
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Неверный логин или пароль. Уточни у учителя.");
      setLoading(false);
    } else {
      router.replace("/feed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "var(--color-navy)" }}>
      <BgShapes />

      <div className="relative flex-1 flex flex-col justify-between px-6 pt-12 pb-8">
        {/* Logo + title */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 mb-5">
            <Image src="/logo.png" alt="ONE! International School" fill style={{ objectFit: "contain" }} priority />
          </div>
          <h1 className="text-white font-black text-[26px] leading-tight tracking-tight">
            Дневник путешественника
          </h1>
          <p className="text-[13px] mt-2" style={{ color: "rgba(214,245,238,0.6)" }}>
            ONE! International School
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-10">
          <div>
            <label className="block text-[10px] font-black tracking-widest mb-1.5 uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>Логин</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   placeholder="твой@email.ru" required
                   className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
                   style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff" }} />
          </div>
          <div>
            <label className="block text-[10px] font-black tracking-widest mb-1.5 uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••" required
                   className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
                   style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff" }} />
          </div>

          {error && (
            <p className="text-[12px] text-center font-black rounded-full px-4 py-2" style={{ background: "rgba(198,40,40,0.25)", color: "#FFCDD2" }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
                  className="w-full rounded-full py-4 text-white font-black text-sm mt-2 transition-opacity disabled:opacity-60"
                  style={{ background: "var(--color-orange)" }}>
            {loading ? "Входим..." : "Войти"}
          </button>

          <button type="button" onClick={() => router.push("/feed")}
                  className="w-full rounded-full py-3 font-black text-sm transition-opacity"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
            Посмотреть без входа
          </button>

          <div className="rounded-[12px] p-3 flex items-start gap-2.5 mt-1" style={{ background: "rgba(214,245,238,0.08)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(214,245,238,0.5)" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(214,245,238,0.55)" }}>
              Учётную запись создаёт учитель
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
