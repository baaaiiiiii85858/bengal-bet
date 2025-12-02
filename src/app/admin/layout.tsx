"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== "admin" && user.role !== "master_admin")) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "master_admin")) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
