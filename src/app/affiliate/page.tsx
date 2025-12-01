"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, Check, Users, Coins } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://bengalbet.com/ref/user123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-bold text-white">Refer & Earn</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Total Invited</span>
              </div>
              <div className="text-2xl font-bold text-white">12</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Coins className="w-4 h-4" />
                <span className="text-xs">Commission</span>
              </div>
              <div className="text-2xl font-bold text-gold">৳ 450</div>
            </div>
          </div>

          {/* Level Info */}
          <div className="bg-linear-to-r from-gold/20 to-transparent p-4 rounded-xl border border-gold/30">
            <h3 className="font-bold text-gold mb-1">Current Level: 1</h3>
            <p className="text-sm text-slate-300">You are earning 50% commission from direct referrals.</p>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Your Referral Link</label>
            <div className="flex space-x-2">
              <Input value={referralLink} readOnly className="bg-slate-800" />
              <Button onClick={handleCopy} variant="outline" className="w-12 px-0">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl text-xs text-slate-400 space-y-2">
            <p>1. Share your link with friends.</p>
            <p>2. They register and deposit.</p>
            <p>3. You get instant commission!</p>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
