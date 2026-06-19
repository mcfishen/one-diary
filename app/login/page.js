"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/components/AuthProvider";

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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/feed");
    } catch {
      setError("Неверный логин или пароль. Уточни у учителя.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-navy)" }}>
      <div className="flex-1 flex flex-col justify-between p-6 pb-8">
        <div className="mt-10">
          <div
            className="w-16 h-16 rounded-[14px] flex items-center justify-center mb-4"
            style={{ background: "var(--color-orange)" }}
          >
            <span className="text-white font-black text-xl tracking-tighter">ONE!</span>
          </div>
          <h1 className="text-white font-black text-[28px] leading-tight tracking-tight mb-2">
            Дневник<br />школьных<br />поездок
          </h1>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(214,245,238,0.65)" }}>
            Делись впечатлениями,<br />смотри записи одноклассников
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-black tracking-widest mb-1.5 uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Логин
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="твой@email.ru"
              required
              className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black tracking-widest mb-1.5 uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            />
          </div>

          {error && (
            <p className="text-[12px] text-center font-black" style={{ color: "#FFCDD2" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3.5 text-white font-black text-sm mt-1 transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading ? "Входим..." : "Войти"}
          </button>

          <div
            className="rounded-[12px] p-3 flex items-start gap-2.5 mt-1"
            style={{ background: "rgba(214,245,238,0.1)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(214,245,238,0.6)" strokeWidth={2}
                 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(214,245,238,0.65)" }}>
              Учётную запись создаёт учитель или администратор школы
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
