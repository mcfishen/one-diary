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
  return data.publicUrl;
}

export async function uploadMedia(file, postId) {
  const ext = file.name.split(".").pop();
  const path = `posts/${postId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
