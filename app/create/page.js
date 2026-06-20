"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { getUser, getTrips, createPost, updatePostMediaUrls } from "@/lib/db";
import { uploadMedia } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import PageShapes from "@/components/PageShapes";

const MOODS = ["Восторг", "Интерес", "Радость", "Удивление", "Задумчивость", "Спокойствие"];

export default function CreatePage() {
  const user = useUser();
  const router = useRouter();
  const fileRef = useRef();

  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace("/login"); return; }
    getUser(user.id).then(setProfile);
    getTrips().then(setTrips);
  }, [user, router]);

  function handleFiles(e) {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPreviews((prev) => [...prev, { url, type: f.type }]);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!tripId || !text.trim()) return;
    setLoading(true);
    setUploadError("");
    try {
      const trip = trips.find((t) => t.id === tripId);
      const post = await createPost({
        tripId,
        tripName: trip?.name || "",
        text,
        mood,
        authorId:    user.id,
        authorName:  profile?.display_name || "",
        authorClass: profile?.class || "",
        authorPhoto: profile?.photo_url || "",
      });
      if (files.length) {
        const urls = await Promise.all(files.map((f) => uploadMedia(f, post.id)));
        await updatePostMediaUrls(post.id, urls);
      }
      setDone(true);
      setTimeout(() => router.replace("/feed"), 1800);
    } catch (err) {
      console.error(err);
      setUploadError("Не удалось загрузить файл. Видео должно быть не больше 50 МБ.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--color-mint)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth={2.5} className="w-8 h-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-[20px] font-black tracking-tight" style={{ color: "var(--color-title)" }}>
          Запись отправлена!
        </h2>
        <p className="text-[13px]" style={{ color: "var(--color-sub)" }}>
          Учитель проверит её и опубликует в ленте
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: "var(--color-wh)" }}>
      <PageShapes />
      <div className="flex items-center justify-between px-4 pt-5 pb-3" style={{ background: "var(--color-navy)" }}>
        <div>
          <h1 className="text-[18px] font-black text-white tracking-tight">Новая запись</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Расскажи о своей поездке</p>
        </div>
        <button onClick={() => router.back()} aria-label="Закрыть"
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: "var(--color-title)" }}>Поездка</p>
          <div className="flex flex-col gap-2">
            {trips.length === 0 && (
              <p className="text-[12px]" style={{ color: "var(--color-sub)" }}>
                Поездки добавит учитель в консоли Supabase
              </p>
            )}
            {trips.map((t) => (
              <button key={t.id} type="button" onClick={() => setTripId(t.id)}
                      className="flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-left transition-colors"
                      style={{
                        background: tripId === t.id ? "rgba(237,118,21,0.06)" : "var(--color-card)",
                        border: `1.5px solid ${tripId === t.id ? "var(--color-orange)" : "var(--color-hr)"}`,
                        boxShadow: "var(--shadow-sm)",
                      }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: tripId === t.id ? "var(--color-orange)" : "var(--color-hr)" }} />
                <div>
                  <p className="text-[12px] font-black" style={{ color: "var(--color-title)" }}>{t.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--color-sub)" }}>{t.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: "var(--color-title)" }}>Впечатления</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} required
                    placeholder="Что тебе понравилось? Что удивило? Что запомнится навсегда?"
                    className="w-full rounded-[12px] px-3.5 py-3 text-[13px] leading-relaxed outline-none resize-none"
                    style={{ border: "1.5px solid var(--color-hr)", background: "var(--color-card)", color: "var(--color-ink)" }} />
        </div>

        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: "var(--color-title)" }}>Настроение</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button key={m} type="button" onClick={() => setMood(m === mood ? "" : m)}
                      className="text-[11px] font-black rounded-full px-3 py-1.5 transition-colors"
                      style={{
                        border: `1.5px solid ${mood === m ? "var(--color-orange)" : "var(--color-hr)"}`,
                        background: mood === m ? "rgba(237,118,21,0.08)" : "var(--color-card)",
                        color: mood === m ? "var(--color-orange)" : "var(--color-sub)",
                      }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: "var(--color-title)" }}>Фото и видео</p>
          <button type="button" onClick={() => fileRef.current.click()}
                  className="w-full rounded-[12px] py-5 flex flex-col items-center gap-2"
                  style={{ border: "1.5px dashed var(--color-orange)", background: "rgba(237,118,21,0.04)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth={1.5} className="w-6 h-6">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-[11px] font-black" style={{ color: "var(--color-orange)" }}>Добавить фото или видео</p>
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFiles} />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {previews.map((p, i) => (
                <div key={i} className="w-16 h-16 rounded-[10px] flex-shrink-0 overflow-hidden" style={{ background: "var(--color-sl)" }}>
                  {p.type.startsWith("video") ? (
                    <video src={p.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {uploadError && (
          <p className="text-[12px] font-black text-center rounded-[10px] px-4 py-2.5"
             style={{ background: "rgba(198,40,40,0.1)", color: "#c62828" }}>
            {uploadError}
          </p>
        )}

        <button type="submit" disabled={loading || !tripId || !text.trim()}
                className="w-full rounded-full py-3.5 text-white font-black text-sm transition-opacity disabled:opacity-50 mb-2"
                style={{ background: "var(--color-orange)" }}>
          {loading ? "Отправляем..." : "Отправить на проверку"}
        </button>

        <div className="rounded-[12px] p-3 flex items-center gap-2.5 mb-4" style={{ background: "var(--color-mint)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-navy-700)" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-[11px]" style={{ color: "var(--color-navy-700)" }}>
            Учитель проверит запись перед публикацией в ленте
          </p>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
