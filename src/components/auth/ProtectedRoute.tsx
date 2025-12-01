"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal();
      router.push("/"); // Redirect to home while showing modal
    }
  }, [user, loading, router, openAuthModal]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gold">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
