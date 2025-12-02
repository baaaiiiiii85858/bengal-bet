"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

const methods = [
  { id: "bkash", name: "bKash", color: "bg-pink-600" },
  { id: "nagad", name: "Nagad", color: "bg-orange-600" },
];

export default function WithdrawPage() {
  const [selectedMethod, setSelectedMethod] = useState(methods[0]);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { balance, user, remainingTurnover } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || !pin) {
        alert("Please fill all fields");
        setLoading(false);
        return;
      }

      if (Number(amount) > balance) {
        alert("Insufficient balance");
        setLoading(false);
        return;
      }

      if (remainingTurnover > 0) {
        alert(`You must complete the turnover requirement. Remaining: ৳${remainingTurnover}`);
        setLoading(false);
        return;
      }

      // Check if user has set a Withdraw PIN
      if (!user?.withdrawPin) {
        alert("Please set your Withdraw PIN in Profile first.");
        router.push("/profile?open=account");
        setLoading(false);
        return;
      }

      // Verify PIN
      if (pin !== user.withdrawPin) {
        alert("Incorrect Withdraw PIN!");
        setLoading(false);
        return;
      }

      // Get saved wallet number
      const walletNumber = user?.walletInfo?.[selectedMethod.id as "bkash" | "nagad"];
      if (!walletNumber) {
        alert(`Please add your ${selectedMethod.name} number in Profile first.`);
        router.push("/profile?open=account");
        setLoading(false);
        return;
      }

      if (!auth.currentUser) {
        alert("User not authenticated");
        return;
      }

      await addDoc(collection(db, "withdrawals"), {
        userId: auth.currentUser.uid,
        amount: Number(amount),
        method: selectedMethod.id,
        walletNumber,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      alert("Withdrawal request submitted successfully!");
      router.push("/wallet");
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      alert("Failed to submit withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">Withdraw Money</h1>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Available Balance</span>
            <span className="text-xl font-bold text-gold">৳ {balance.toFixed(2)}</span>
          </div>
          {remainingTurnover > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-400">Remaining Turnover</span>
              <span className="font-bold text-red-400">৳ {remainingTurnover.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Methods */}
        <div className="grid grid-cols-2 gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedMethod.id === method.id
                  ? "border-gold bg-slate-800"
                  : "border-slate-700 bg-slate-900 opacity-60"
              }`}
            >
              <div className={`w-full h-8 rounded mb-2 ${method.color}`} />
              <div className="text-xs font-bold text-white">{method.name}</div>
            </button>
          ))}
        </div>

        {/* Saved Number Display */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <p className="text-sm text-slate-400 mb-1">Withdraw to:</p>
          {user?.walletInfo?.[selectedMethod.id as "bkash" | "nagad"] ? (
            <p className="text-lg font-mono text-white">
              {user.walletInfo[selectedMethod.id as "bkash" | "nagad"]}
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-red-400 text-sm">No number saved</p>
              <Link href="/profile?open=account" className="text-xs bg-slate-800 px-3 py-1 rounded text-white hover:bg-slate-700">
                Add Number
              </Link>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Withdraw Amount</label>
            <Input 
              type="number" 
              placeholder="Min 500" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Withdraw PIN</label>
            <Input 
              type="password" 
              maxLength={4}
              placeholder="Enter 4-digit PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <Button 
            variant="gold" 
            className="w-full h-12 text-lg font-bold"
            disabled={loading || remainingTurnover > 0}
          >
            {loading ? "Submitting..." : "Request Withdraw"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
