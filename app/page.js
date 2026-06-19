"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";

export default function Home() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    if (user) router.replace("/feed");
    else router.replace("/login");
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
           style={{ borderColor: "var(--color-orange)", borderTopColor: "transparent" }} />
    </div>
  );
}
