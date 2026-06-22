import { createClient } from "@supabase/supabase-js";

const direct = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// В браузере обращаемся к базе через прокси на нашем домене (/db),
// чтобы Supabase работал без VPN. На сервере — напрямую.
const url = typeof window !== "undefined" ? `${window.location.origin}/db` : direct;

export const supabase = createClient(url, key);
