"use client";

import { useState, useEffect, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  User, MessageCircle, LogOut, Wallet, 
  Gift, Users, CalendarCheck, History, Gamepad2, ChevronRight, X, Settings 
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Import new components
import { AccountRecord } from "./components/AccountRecord";
import { BettingRecord } from "./components/BettingRecord";
import { RewardCenter } from "./components/RewardCenter";
import { InviteFriend } from "./components/InviteFriend";
import { SignInTask } from "./components/SignInTask";
import { AccountManagement } from "./components/AccountManagement";

function ProfileContent() {
  const { user, logout } = useUser();
  const searchParams = useSearchParams();
  const [activeModal, setActiveModal] = useState<string | null>(
    searchParams.get('open') === 'account' ? 'account_mgmt' : null
  );

  useEffect(() => {
    const openParam = searchParams.get('open');
    if (openParam === 'account') {
      setTimeout(() => {
        setActiveModal((prev) => (prev !== 'account_mgmt' ? 'account_mgmt' : prev));
      }, 0);
    }
  }, [searchParams]);

  const menuItems = [
    { id: "account_mgmt", label: "Account Management", icon: Settings, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "reward", label: "Reward Center", icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
    { id: "invite", label: "Invite Friends", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { id: "signin", label: "Sign-in Task", icon: CalendarCheck, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "account", label: "Account Record", icon: History, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "betting", label: "Betting Record", icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const renderModalContent = () => {
    switch (activeModal) {
      case "account_mgmt": return <AccountManagement />;
      case "reward": return <RewardCenter />;
      case "invite": return <InviteFriend />;
      case "signin": return <SignInTask />;
      case "account": return <AccountRecord />;
      case "betting": return <BettingRecord />;
      default: return null;
    }
  };

  const getModalTitle = () => {
    const item = menuItems.find(i => i.id === activeModal);
    return item ? item.label : "";
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="pb-24 pt-20 px-4 space-y-6">
          
          {/* Header Card */}
          <div className="bg-linear-to-r from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-gold shadow-lg">
                <User className="w-8 h-8 text-gold" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{user?.name || "Set Name"}</h1>
                </div>
                <p className="text-slate-400 text-xs mt-1">ID: {user?.id?.slice(0, 8).toUpperCase()}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">
                  VIP Level 1
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wallet/deposit" className="bg-linear-to-br from-green-600 to-emerald-700 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-white">Deposit</span>
            </Link>
            <Link href="/wallet/withdraw" className="bg-linear-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-white rotate-180" />
              </div>
              <span className="font-bold text-white">Withdraw</span>
            </Link>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-700 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-xs font-medium text-slate-300">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white px-1">Settings</h3>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-700">
              
              {/* Support & Logout */}
              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
              
              <button 
                onClick={logout}
                className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-500 group-hover:text-red-400">Logout</span>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Modal */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-800 shadow-2xl h-[80vh] sm:h-auto flex flex-col animate-in slide-in-from-bottom-10">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">{getModalTitle()}</h3>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {renderModalContent()}
              </div>
            </div>
          </div>
        )}

      </MainLayout>
    </ProtectedRoute>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
