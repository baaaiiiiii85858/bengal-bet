"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, Check, Gift } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PaymentMethod {
  id: string;
  name: string;
  color: string;
  number: string;
  type: string;
}

export default function DepositPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
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
    const fetchPaymentNumbers = async () => {
      try {
        const q = query(collection(db, "payment_numbers"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        
        const fetchedMethods: PaymentMethod[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let name = "Unknown";
          let color = "bg-gray-600";

          if (data.type === 'bkash') {
            name = "bKash";
            color = "bg-pink-600";
          } else if (data.type === 'nagad') {
            name = "Nagad";
            color = "bg-orange-600";
          } else if (data.type === 'rocket') {
            name = "Rocket";
            color = "bg-purple-600";
          } else if (data.type === 'upay') {
            name = "Upay";
            color = "bg-blue-600";
          }

          return {
            id: doc.id,
            name,
            color,
            number: data.number,
            type: data.type
          };
        });

        setMethods(fetchedMethods);
        if (fetchedMethods.length > 0) {
          setSelectedMethod(fetchedMethods[0]);
        }
      } catch (error) {
        console.error("Error fetching payment numbers:", error);
      }
    };

    fetchPaymentNumbers();
  }, []);

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
    if (selectedMethod) {
      navigator.clipboard.writeText(selectedMethod.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || !senderNumber || !trxId || !selectedMethod) {
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
        method: selectedMethod.type, // Use type (bkash/nagad) instead of id
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
        {methods.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  selectedMethod?.id === method.id
                    ? "border-gold bg-slate-800"
                    : "border-slate-700 bg-slate-900 opacity-60"
                }`}
              >
                {method.type === 'bkash' ? (
                  <div className="w-full h-12 relative">
                    <Image src="/bkash.png" alt="bKash" fill className="object-contain" />
                  </div>
                ) : method.type === 'nagad' ? (
                  <div className="w-full h-12 relative">
                    <Image src="/nagad.png" alt="Nagad" fill className="object-contain" />
                  </div>
                ) : (
                  <div className={`w-full h-12 rounded ${method.color}`} />
                )}
                <div className="text-xs font-bold text-white">{method.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{method.number}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-800 rounded-xl text-center text-slate-400">
            No payment methods available. Please contact support.
          </div>
        )}

        {/* Admin Number */}
        {selectedMethod && (
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
        )}

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
            disabled={loading || !selectedMethod}
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}

