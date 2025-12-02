"use client";

import { Copy, Users, Share2, TrendingUp, DollarSign, Gift } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function InviteFriend() {
  const { user, affiliateSettings } = useUser();
  const referralCode = user?.referralCode || user?.id?.slice(0, 8).toUpperCase() || "LOADING";
  const domain = affiliateSettings?.referralDomain || "https://bengalbet.com";
  const referralLink = `${domain}/register?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-br from-green-600 to-emerald-800 p-6 rounded-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 pattern-grid-lg opacity-20" />
        <Users className="w-12 h-12 mx-auto text-white mb-2 relative z-10" />
        <h3 className="text-2xl font-bold text-white relative z-10">Invite Friends & Earn</h3>
        <p className="text-white/80 text-sm relative z-10">Build your network and earn lifetime commissions!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
          <Users className="w-5 h-5 mx-auto text-blue-400 mb-1" />
          <div className="text-lg font-bold text-white">{user?.affiliateStats?.totalInvited || 0}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Invited</div>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
          <DollarSign className="w-5 h-5 mx-auto text-green-400 mb-1" />
          <div className="text-lg font-bold text-white">৳{user?.affiliateStats?.totalEarnings || 0}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Earnings</div>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
          <Gift className="w-5 h-5 mx-auto text-purple-400 mb-1" />
          <div className="text-lg font-bold text-white">৳{user?.affiliateStats?.claimable || 0}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Claimable</div>
        </div>
      </div>

      {/* Rules */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
        <h4 className="font-bold text-gold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> How it Works
        </h4>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Share your referral link with friends.
          </li>
          <li className="flex gap-2">
            <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            Get <span className="text-green-400 font-bold">৳{affiliateSettings?.bonusAmount} Bonus</span> when they bet ৳{affiliateSettings?.turnoverTarget} total.
          </li>
          <li className="flex gap-2">
            <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            Earn <span className="text-yellow-500 font-bold">{affiliateSettings?.commissionPercent}% commission</span> on their losses forever!
          </li>
        </ul>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-slate-400 mb-1 block">Referral Link</label>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-slate-600">
            <span className="text-sm text-slate-300 truncate mr-2">{referralLink}</span>
            <button onClick={() => copyToClipboard(referralLink)} className="text-slate-400 hover:text-white">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Join Bengal Bet',
                text: 'Join me on Bengal Bet and get a bonus!',
                url: referralLink,
              });
            } else {
              copyToClipboard(referralLink);
            }
          }}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-5 h-5" /> Share Now
        </button>
      </div>
    </div>
  );
}
