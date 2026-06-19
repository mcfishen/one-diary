import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadMedia(file, postId) {
  const ext = file.name.split(".").pop();
  const path = `posts/${postId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}
