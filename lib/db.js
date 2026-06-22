import { supabase } from "./supabase";

// --- POSTS ---

export function subscribeToPosts(callback) {
  supabase
    .from("posts")
    .select("*, comments(count)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(30)
    .then(({ data }) => callback(data || []));

  const channel = supabase
    .channel("posts-feed")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(30)
        .then(({ data }) => callback(data || []));
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToPostsByClass(classId, callback) {
  supabase
    .from("posts")
    .select("*, comments(count)")
    .eq("status", "published")
    .eq("author_class", classId)
    .order("created_at", { ascending: false })
    .then(({ data }) => callback(data || []));

  const channel = supabase
    .channel("posts-class")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("author_class", classId)
        .order("created_at", { ascending: false })
        .then(({ data }) => callback(data || []));
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function getPost(postId) {
  const { data } = await supabase
    .from("posts")
    .select("*, comments(*)")
    .eq("id", postId)
    .single();
  return data;
}

export async function createPost(data) {
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      trip_id:      data.tripId,
      trip_name:    data.tripName,
      text:         data.text,
      mood:         data.mood,
      author_id:    data.authorId,
      author_name:  data.authorName,
      author_class: data.authorClass,
      author_photo: data.authorPhoto,
      location:     data.location || null,
      weather:      data.weather || null,
      media_urls:   [],
      status:       "pending",
      heart_count:  0,
      star_count:   0,
    })
    .select()
    .single();
  if (error) throw error;
  return post;
}

export async function updatePostMediaUrls(postId, urls) {
  await supabase.from("posts").update({ media_urls: urls }).eq("id", postId);
}

export async function updatePostStatus(postId, status) {
  await supabase.from("posts").update({ status }).eq("id", postId);
}

export async function deletePost(postId) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function addReaction(postId, type, delta) {
  const field = type === "heart" ? "heart_count" : "star_count";
  const { data } = await supabase.from("posts").select(field).eq("id", postId).single();
  if (!data) return;
  const newVal = Math.max(0, (data[field] || 0) + delta);
  await supabase.from("posts").update({ [field]: newVal }).eq("id", postId);
}

// --- PENDING (for teacher) ---

export function subscribeToPending(callback) {
  supabase
    .from("posts")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .then(({ data }) => callback(data || []));

  const channel = supabase
    .channel("posts-pending")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
      supabase
        .from("posts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .then(({ data }) => callback(data || []));
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// --- USERS ---

export async function getUser(uid) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  return data;
}

export async function getUserPosts(uid) {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", uid)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getProfiles() {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("display_name", { ascending: true });
  return data || [];
}

// --- TRIPS ---

export async function getTrips() {
  const { data } = await supabase
    .from("trips")
    .select("*")
    .order("date", { ascending: false });
  return data || [];
}

// --- PROFILE UPDATE ---

export async function updateProfile(uid, updates) {
  await supabase.from("profiles").update(updates).eq("id", uid);
}

// --- COMMENTS ---

export async function addComment(postId, comment) {
  await supabase.from("comments").insert({
    post_id:     postId,
    author_id:   comment.authorId,
    author_name: comment.authorName,
    text:        comment.text,
  });
}
