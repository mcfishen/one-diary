import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Только этот аккаунт может создавать учеников
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

    // 1. Проверяем, кто вызывает (по токену сессии)
    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return Response.json({ error: "Нет авторизации." }, { status: 401 });

    const anon = createClient(url, anonKey);
    const { data: { user: caller }, error: callerErr } = await anon.auth.getUser(token);
    if (callerErr || !caller) return Response.json({ error: "Сессия недействительна." }, { status: 401 });
    if (caller.email?.toLowerCase() !== ALLOWED_EMAIL) {
      return Response.json({ error: "У тебя нет прав на создание учеников." }, { status: 403 });
    }

    // 2. Данные нового ученика
    const { email, password, displayName, className } = await request.json();
    if (!email || !password || !displayName) {
      return Response.json({ error: "Заполни имя, email и пароль." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Пароль должен быть не меньше 6 символов." }, { status: 400 });
    }

    // 3. Создаём пользователя с админ-ключом (сразу подтверждён)
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, role: "student" },
    });

    if (createErr) {
      const msg = /already|exists|registered/i.test(createErr.message || "")
        ? "Пользователь с таким email уже существует."
        : createErr.message;
      return Response.json({ error: msg }, { status: 400 });
    }

    // 4. Дозаполняем класс в профиле (триггер уже создал строку)
    const newId = created.user.id;
    await admin
      .from("profiles")
      .update({ display_name: displayName, class: className || null, role: "student" })
      .eq("id", newId);

    return Response.json({ ok: true, id: newId });
  } catch (e) {
    return Response.json({ error: e?.message || "Ошибка сервера." }, { status: 500 });
  }
}
