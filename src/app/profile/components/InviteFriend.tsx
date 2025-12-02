"use client";

import { Copy, Users, Share2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function InviteFriend() {
  const { user } = useUser();
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "LOADING";
  const referralLink = `https://bengalbet.com/register?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-green-600 to-emerald-800 p-6 rounded-2xl text-center">
        <Users className="w-12 h-12 mx-auto text-white mb-2" />
        <h3 className="text-xl font-bold text-white">Invite Friends & Earn</h3>
        <p className="text-white/80 text-sm">Get 10% of their first deposit!</p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-slate-400 mb-1 block">Your Referral Code</label>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-slate-600">
            <span className="font-mono font-bold text-xl text-white tracking-wider">{referralCode}</span>
            <button onClick={() => copyToClipboard(referralCode)} className="text-slate-400 hover:text-white">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-slate-400 mb-1 block">Referral Link</label>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-slate-600">
            <span className="text-sm text-slate-300 truncate mr-2">{referralLink}</span>
            <button onClick={() => copyToClipboard(referralLink)} className="text-slate-400 hover:text-white">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" /> Share Now
        </button>
      </div>
    </div>
  );
}
