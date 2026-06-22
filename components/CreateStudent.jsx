"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateStudent() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok" | "err", text }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/create-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ email, password, displayName: name, className: cls }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "Не удалось создать ученика." });
      } else {
        setMsg({ type: "ok", text: `Готово! Ученик «${name}» создан. Логин: ${email}` });
        setName(""); setCls(""); setEmail(""); setPassword("");
      }
    } catch {
      setMsg({ type: "err", text: "Ошибка сети. Попробуй ещё раз." });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    border: "1.5px solid var(--color-hr)",
    background: "var(--color-card)",
    color: "var(--color-ink)",
  };

  return (
    <div className="rounded-[12px] overflow-hidden" style={{ background: "var(--color-sl)" }}>
      <button onClick={() => setOpen((o) => !o)}
              className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ background: "var(--color-orange)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} className="w-4 h-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[13px] font-black" style={{ color: "var(--color-title)" }}>Создать ученика</p>
            <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>Новый аккаунт прямо здесь</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-sub)" strokeWidth={2.5}
             className="w-4 h-4 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <form onSubmit={submit} className="px-4 pb-4 flex flex-col gap-2.5">
          <input value={name} onChange={(e) => setName(e.target.value)} required
                 placeholder="Имя и фамилия"
                 className="w-full rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none" style={inputStyle} />
          <input value={cls} onChange={(e) => setCls(e.target.value)}
                 placeholder="Класс (например, 5А)"
                 className="w-full rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none" style={inputStyle} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email"
                 placeholder="Email (логин ученика)"
                 className="w-full rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none" style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} required
                 placeholder="Пароль (минимум 6 символов)"
                 className="w-full rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none" style={inputStyle} />

          {msg && (
            <p className="text-[11px] font-black rounded-[10px] px-3 py-2 text-center"
               style={msg.type === "ok"
                 ? { background: "rgba(46,125,50,0.12)", color: "#2E7D32" }
                 : { background: "rgba(198,40,40,0.1)", color: "#c62828" }}>
              {msg.text}
            </p>
          )}

          <button type="submit" disabled={loading}
                  className="w-full rounded-full py-3 text-white font-black text-[13px] transition-opacity disabled:opacity-50"
                  style={{ background: "var(--color-orange)" }}>
            {loading ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>
      )}
    </div>
  );
}
