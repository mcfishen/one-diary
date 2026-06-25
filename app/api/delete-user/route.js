import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Только этот аккаунт может удалять пользователей
const ALLOWED_EMAIL = "ruslanfom2@gmail.com";

export async function POST(request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return Response.json(
        { error: "Сервер не настроен: добавь SUPABASE_SERVICE_ROLE_KEY в переменные Vercel." },
        { status: 500 }
      );
    }

    // 1. Проверяем, кто вызывает
    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return Response.json({ error: "Нет авторизации." }, { status: 401 });

    const anon = createClient(url, anonKey);
    const { data: { user: caller }, error: callerErr } = await anon.auth.getUser(token);
    if (callerErr || !caller) return Response.json({ error: "Сессия недействительна." }, { status: 401 });
    if (caller.email?.toLowerCase() !== ALLOWED_EMAIL) {
      return Response.json({ error: "У тебя нет прав на удаление пользователей." }, { status: 403 });
    }

    // 2. Кого удаляем
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: "Не указан пользователь." }, { status: 400 });
    if (userId === caller.id) {
      return Response.json({ error: "Нельзя удалить собственный аккаунт." }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 3. Сначала убираем связанные записи (иначе внешние ключи не дадут удалить)
    await admin.from("comments").delete().eq("author_id", userId);
    await admin.from("posts").delete().eq("author_id", userId);

    // 4. Удаляем сам аккаунт (профиль удалится каскадом)
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) return Response.json({ error: delErr.message }, { status: 400 });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e?.message || "Ошибка сервера." }, { status: 500 });
  }
}
