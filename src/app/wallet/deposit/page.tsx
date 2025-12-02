"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, Check, Gift } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const methods = [
  { id: "bkash", name: "bKash", color: "bg-pink-600", number: "01700000000" },
  { id: "nagad", name: "Nagad", color: "bg-orange-600", number: "01800000000" },
];

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState(methods[0]);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [bonusPercent, setBonusPercent] = useState(0);
  const [bonusLabel, setBonusLabel] = useState("");
  const [wantsBonus, setWantsBonus] = useState(true);
  
  const { user } = useUser(); 
  const router = useRouter();

  useEffect(() => {
    const fetchBonusInfo = async () => {
      if (!user) return;

      try {
        // Check for Special Bonus first
        if (user.specialBonus) {
          setBonusPercent(user.specialBonus);
          setBonusLabel("Special Offer");
          return;
        }

        // Check Tiered Bonus
        const settingsSnap = await getDoc(doc(db, "settings", "finance"));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          const depositCount = (user.depositCount || 0) + 1; // Next deposit
          
          if (depositCount === 1) {
            setBonusPercent(data.firstDepositBonus || 0);
            setBonusLabel("1st Deposit Bonus");
          } else if (depositCount === 2) {
            setBonusPercent(data.secondDepositBonus || 0);
            setBonusLabel("2nd Deposit Bonus");
          } else if (depositCount === 3) {
            setBonusPercent(data.thirdDepositBonus || 0);
            setBonusLabel("3rd Deposit Bonus");
          } else {
            setBonusPercent(0);
            setBonusLabel("");
          }
        }
      } catch (error) {
        console.error("Error fetching bonus info:", error);
      }
    };
    fetchBonusInfo();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedMethod.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || !senderNumber || !trxId) {
        alert("Please fill all fields");
        setLoading(false);
        return;
      }

      const { auth } = await import("@/lib/firebase");
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("You must be logged in");
        router.push("/login");
        return;
      }

      await addDoc(collection(db, "deposits"), {
        userId: currentUser.uid,
        amount: Number(amount),
        method: selectedMethod.id,
        senderNumber,
        trxId,
        status: "pending",
        wantsBonus, // Pass user preference
        createdAt: new Date().toISOString()
      });

      alert("Deposit request submitted successfully!");
      router.push("/wallet");
    } catch (error) {
      console.error("Error submitting deposit:", error);
      alert("Failed to submit deposit");
    } finally {
      setLoading(false);
    }
  };

  const bonusAmount = amount ? (Number(amount) * bonusPercent) / 100 : 0;

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">Deposit Money</h1>

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

        {/* Admin Number */}
        <div className="bg-slate-800 p-4 rounded-xl space-y-2 border border-slate-700">
          <label className="text-sm text-slate-400">Send Money to this Number</label>
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
            <span className="font-mono text-lg font-bold text-gold">{selectedMethod.number}</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-white">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            * Only Send Money / Cash Out allowed. No Mobile Recharge.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Amount</label>
            <Input 
              type="number" 
              placeholder="Min 500" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            
            {/* Bonus Display & Toggle */}
            {bonusPercent > 0 && amount && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border transition-colors ${
                  wantsBonus 
                    ? "bg-green-500/10 border-green-500/20 text-green-400" 
                    : "bg-gray-800 border-gray-700 text-gray-400"
                }`}>
                  <Gift className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-bold">{bonusLabel}: +৳{bonusAmount.toFixed(0)} ({bonusPercent}%)</p>
                    {wantsBonus && <p className="text-xs opacity-80">Turnover requirement applies.</p>}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={wantsBonus}
                      onChange={(e) => setWantsBonus(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    I want to receive this bonus
                  </span>
                </label>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Sender Number</label>
            <Input 
              type="tel" 
              placeholder="01xxxxxxxxx" 
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Transaction ID</label>
            <Input 
              type="text" 
              placeholder="8N7..." 
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
            />
          </div>

          <Button 
            variant="gold" 
            className="w-full h-12 text-lg font-bold"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
