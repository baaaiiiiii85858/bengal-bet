"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InviteFriend } from "@/app/profile/components/InviteFriend";

export default function AffiliatePage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-6">Refer & Earn</h1>
          <InviteFriend />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
