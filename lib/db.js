import {
  collection, addDoc, getDocs, getDoc, doc,
  query, orderBy, where, onSnapshot,
  updateDoc, serverTimestamp, limit,
} from "firebase/firestore";
import { db } from "./firebase";

// --- POSTS ---

export function subscribeToPosts(callback) {
  const q = query(
    collection(db, "posts"),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
}

export function subscribeToPostsByClass(classId, callback) {
  const q = query(
    collection(db, "posts"),
    where("status", "==", "published"),
    where("authorClass", "==", classId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function getPost(postId) {
  const snap = await getDoc(doc(db, "posts", postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createPost(data) {
  return addDoc(collection(db, "posts"), {
    ...data,
    status: "pending",
    reactions: { heart: 0, star: 0 },
    comments: [],
    createdAt: serverTimestamp(),
  });
}

export async function updatePostStatus(postId, status) {
  return updateDoc(doc(db, "posts", postId), { status });
}

export async function addReaction(postId, type, delta) {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const reactions = snap.data().reactions || {};
  return updateDoc(ref, {
    [`reactions.${type}`]: Math.max(0, (reactions[type] || 0) + delta),
  });
}

// --- PENDING POSTS (for teacher) ---

export function subscribeToPending(callback) {
  const q = query(
    collection(db, "posts"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// --- USERS ---

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUserPosts(uid) {
  const q = query(
    collection(db, "posts"),
    where("authorId", "==", uid),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- TRIPS ---

export async function getTrips() {
  const snap = await getDocs(collection(db, "trips"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- COMMENTS ---

export async function addComment(postId, comment) {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const comments = snap.data().comments || [];
  return updateDoc(ref, { comments: [...comments, { ...comment, createdAt: new Date().toISOString() }] });
}
