"use client";

import { useState } from "react";
import { User, Mail, Save, Lock, KeyRound, ShieldCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export function AccountManagement() {
  const { user, updateProfile } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [bkash, setBkash] = useState("");
  const [nagad, setNagad] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  // Withdraw PIN States
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Password Change States
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

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

  const handleSetPin = async () => {
    if (pin.length !== 4 || isNaN(Number(pin))) {
      alert("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      alert("PINs do not match");
      return;
    }

    try {
      // If changing PIN, verify old PIN first
      if (user?.withdrawPin) {
        if (oldPin !== user.withdrawPin) {
          alert("Incorrect Old PIN");
          return;
        }
      }

      await updateProfile({ withdrawPin: pin });
      setPin("");
      setConfirmPin("");
      setOldPin("");
      setIsSettingPin(false);
      alert("Withdraw PIN Set Successfully!");
    } catch (error) {
      console.error("Error setting PIN:", error);
      alert("Failed to set PIN");
    }
  };

  const handleChangePassword = async () => {
    if (newPass.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (newPass !== confirmPass) {
      alert("New passwords do not match");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) return;

      // Re-authenticate
      const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
      await reauthenticateWithCredential(currentUser, credential);

      // Update Password
      await updatePassword(currentUser, newPass);
      
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setIsChangingPass(false);
      alert("Password Changed Successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === 'auth/wrong-password') {
        alert("Incorrect Current Password");
      } else {
        alert("Failed to change password: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl text-center">
        <User className="w-12 h-12 mx-auto text-white mb-2" />
        <h3 className="text-xl font-bold text-white">Account Management</h3>
        <p className="text-white/80 text-sm">Manage your personal details and security.</p>
      </div>

      {/* Personal Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Details</h4>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
            <div className="flex gap-2">
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditingName}
                className={`bg-slate-900 ${!isEditingName ? 'opacity-70' : ''}`}
              />
              {isEditingName ? (
                <Button size="sm" variant="gold" onClick={handleSaveName}>
                  <Save className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)}>
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Email/Phone */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Phone Number / Email</label>
            <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg border border-slate-700 opacity-70">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">{user?.phone || user?.id}</span>
              <Lock className="w-3 h-3 text-slate-600 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payment Methods</h4>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
          <p className="text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20 mb-2">
            Important: Payment numbers cannot be changed once set. Please contact support for changes.
          </p>

          {/* bKash */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-pink-600 flex items-center justify-center text-[8px] text-white font-bold">bK</div>
                bKash Number
              </label>
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

          {/* Nagad */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-600 flex items-center justify-center text-[8px] text-white font-bold">Ng</div>
                Nagad Number
              </label>
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

      {/* Security Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Security Settings</h4>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-6">
          
          {/* Withdraw PIN */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <div>
                  <h5 className="font-bold text-white">Withdraw PIN</h5>
                  <p className="text-xs text-slate-400">Required for withdrawals</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={isSettingPin ? "outline" : "ghost"}
                onClick={() => setIsSettingPin(!isSettingPin)}
              >
                {user?.withdrawPin ? "Change PIN" : "Set PIN"}
              </Button>
            </div>

            {isSettingPin && (
              <div className="bg-slate-900 p-4 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                {user?.withdrawPin && (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Old PIN</label>
                    <Input 
                      type="password" 
                      maxLength={4}
                      placeholder="Enter Old PIN"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">New PIN (4 digits)</label>
                    <Input 
                      type="password" 
                      maxLength={4}
                      placeholder="xxxx"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Confirm PIN</label>
                    <Input 
                      type="password" 
                      maxLength={4}
                      placeholder="xxxx"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleSetPin} variant="gold" className="w-full">
                  {user?.withdrawPin ? "Update PIN" : "Set PIN"}
                </Button>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-700" />

          {/* Login Password */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-blue-500" />
                <div>
                  <h5 className="font-bold text-white">Login Password</h5>
                  <p className="text-xs text-slate-400">Change your account password</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={isChangingPass ? "outline" : "ghost"}
                onClick={() => setIsChangingPass(!isChangingPass)}
              >
                Change Password
              </Button>
            </div>

            {isChangingPass && (
              <div className="bg-slate-900 p-4 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Current Password</label>
                  <Input 
                    type="password" 
                    placeholder="Enter Current Password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">New Password</label>
                    <Input 
                      type="password" 
                      placeholder="New Password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Confirm Password</label>
                    <Input 
                      type="password" 
                      placeholder="Confirm Password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword} variant="gold" className="w-full">
                  Update Password
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

