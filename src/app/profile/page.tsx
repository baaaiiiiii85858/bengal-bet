"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Lock, LogOut, MessageCircle, Wallet, Save } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bkash, setBkash] = useState("");
  const [nagad, setNagad] = useState("");

  // No useEffect needed if we use key or just let it be independent

  const handleSaveName = async () => {
    try {
      await updateProfile({ name });
      setIsEditingName(false);
      alert("Name Updated Successfully!");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name");
    }
  };

  const handleSaveWallet = async (type: 'bkash' | 'nagad', value: string) => {
    if (!value) return;
    try {
      await updateProfile({
        walletInfo: {
          ...user?.walletInfo,
          [type]: value
        }
      });
      alert(`${type === 'bkash' ? 'bKash' : 'Nagad'} Number Added Successfully!`);
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      alert(`Failed to add ${type} number`);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-4 space-y-8 pt-20">
          {/* User Info Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-gold">
              <User className="w-8 h-8 text-gold" />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center space-x-2" key={user?.name}>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-lg font-bold"
                    placeholder="Full Name"
                  />
                  <Button size="sm" variant="gold" onClick={handleSaveName}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white">{user?.name || "Set Name"}</h1>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-slate-400"
                    onClick={() => setIsEditingName(true)}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-slate-400 text-sm">{user?.phone}</p>
            </div>
          </div>

          {/* Wallet Management */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gold" />
              Payment Methods
            </h2>
            <div className="bg-slate-800 p-4 rounded-xl space-y-4 border border-slate-700">
              
              {/* bKash Section */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-slate-400">bKash Number</label>
                  {user?.walletInfo?.bkash && <Lock className="w-3 h-3 text-slate-500" />}
                </div>
                {user?.walletInfo?.bkash ? (
                  <Input 
                    value={user.walletInfo.bkash}
                    readOnly
                    className="bg-slate-900 opacity-70 cursor-not-allowed"
                  />
                ) : (
                  <div className="flex space-x-2">
                    <Input 
                      value={bkash}
                      onChange={(e) => setBkash(e.target.value)}
                      placeholder="Add bKash Number"
                      className="bg-slate-900"
                    />
                    <Button onClick={() => handleSaveWallet('bkash', bkash)} variant="gold">
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {/* Nagad Section */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-slate-400">Nagad Number</label>
                  {user?.walletInfo?.nagad && <Lock className="w-3 h-3 text-slate-500" />}
                </div>
                {user?.walletInfo?.nagad ? (
                  <Input 
                    value={user.walletInfo.nagad}
                    readOnly
                    className="bg-slate-900 opacity-70 cursor-not-allowed"
                  />
                ) : (
                  <div className="flex space-x-2">
                    <Input 
                      value={nagad}
                      onChange={(e) => setNagad(e.target.value)}
                      placeholder="Add Nagad Number"
                      className="bg-slate-900"
                    />
                    <Button onClick={() => handleSaveWallet('nagad', nagad)} variant="gold">
                      Save
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Change Password */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold" />
              Change Password
            </h2>
            <form className="space-y-3">
              <Input type="password" placeholder="Current Password" />
              <Input type="password" placeholder="New Password" />
              <Button variant="outline" className="w-full">Update Password</Button>
            </form>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gold" />
              Support
            </h2>
            <Button className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white">
              Contact on Telegram
            </Button>
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
