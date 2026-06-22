import { supabase } from "./supabase";

export async function uploadAvatar(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}.${ext}`;

  await supabase.storage.from("media").remove([path]).catch(() => {});

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "3600", upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function uploadMedia(file, postId, index = 0) {
  const ext = file.name.split(".").pop();
  const unique = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `posts/${postId}/${unique}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
