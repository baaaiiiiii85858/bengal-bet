"use client";
import { useState, useEffect } from "react";
import { Check, X, Plus, Trash2, RefreshCw, Copy, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc, increment, addDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";

interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: string;
  senderNumber: string;
  trxId: string;
  status: string;
  createdAt: string;
  wantsBonus?: boolean;
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  walletNumber: string;
  status: string;
  createdAt: string;
}

interface PaymentNumber {
  id: string;
  number: string;
  type: string;
  active: boolean;
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("deposits");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdraws, setWithdraws] = useState<Withdrawal[]>([]);
  const [numbers, setNumbers] = useState<PaymentNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [smsKey] = useState("sk_live_51M..."); // Placeholder for now
  
  // Settings
  const [firstDepositBonus, setFirstDepositBonus] = useState(0);
  const [secondDepositBonus, setSecondDepositBonus] = useState(0);
  const [thirdDepositBonus, setThirdDepositBonus] = useState(0);
  
  const [firstDepositTurnover, setFirstDepositTurnover] = useState(1);
  const [secondDepositTurnover, setSecondDepositTurnover] = useState(1);
  const [thirdDepositTurnover, setThirdDepositTurnover] = useState(1);
  
  const [turnoverMultiplier, setTurnoverMultiplier] = useState(1); // Default/Global

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Pending Deposits
      const depQ = query(collection(db, "deposits"), where("status", "==", "pending"));
      const depSnap = await getDocs(depQ);
      setDeposits(depSnap.docs.map(d => ({ id: d.id, ...d.data() } as Deposit)));

      // Fetch Pending Withdrawals
      const wdQ = query(collection(db, "withdrawals"), where("status", "==", "pending"));
      const wdSnap = await getDocs(wdQ);
      setWithdraws(wdSnap.docs.map(d => ({ id: d.id, ...d.data() } as Withdrawal)));

      // Fetch Payment Numbers
      const numSnap = await getDocs(collection(db, "payment_numbers"));
      setNumbers(numSnap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentNumber)));

      // Fetch Settings
      const settingsSnap = await getDoc(doc(db, "settings", "finance"));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setFirstDepositBonus(data.firstDepositBonus || 0);
        setSecondDepositBonus(data.secondDepositBonus || 0);
        setThirdDepositBonus(data.thirdDepositBonus || 0);
        
        setFirstDepositTurnover(data.firstDepositTurnover || 1);
        setSecondDepositTurnover(data.secondDepositTurnover || 1);
        setThirdDepositTurnover(data.thirdDepositTurnover || 1);
        
        setTurnoverMultiplier(data.turnoverMultiplier || 1);
      }

    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "finance"), {
        firstDepositBonus,
        secondDepositBonus,
        thirdDepositBonus,
        firstDepositTurnover,
        secondDepositTurnover,
        thirdDepositTurnover,
        turnoverMultiplier
      }, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    }
  };

  const handleDepositAction = async (deposit: Deposit, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        let appliedBonusPercent = 0;
        let appliedTurnoverMult = turnoverMultiplier; // Default to global
        let turnoverReq = 0;

        let bonus = 0; // Define bonus outside

        if (deposit.wantsBonus !== false) { // Default to true if undefined
          // Fetch user to check deposit count and special bonus
          const userSnap = await getDoc(doc(db, "users", deposit.userId));
          const userData = userSnap.data();
          const depositCount = (userData?.depositCount || 0) + 1; // This will be the Nth deposit
          const specialBonus = userData?.specialBonus;

          if (specialBonus !== undefined && specialBonus !== null) {
            appliedBonusPercent = specialBonus;
            // Use specific turnover if set, otherwise global
            if (userData?.specialBonusTurnover) {
              appliedTurnoverMult = userData.specialBonusTurnover;
            } else {
              appliedTurnoverMult = turnoverMultiplier;
            }
          } else {
            if (depositCount === 1) {
              appliedBonusPercent = firstDepositBonus;
              appliedTurnoverMult = firstDepositTurnover;
            } else if (depositCount === 2) {
              appliedBonusPercent = secondDepositBonus;
              appliedTurnoverMult = secondDepositTurnover;
            } else if (depositCount === 3) {
              appliedBonusPercent = thirdDepositBonus;
              appliedTurnoverMult = thirdDepositTurnover;
            } else {
              appliedBonusPercent = 0; // No bonus after 3rd by default
              appliedTurnoverMult = 1; // Standard 1x turnover for regular deposits
            }
          }

          bonus = deposit.amount * (appliedBonusPercent / 100);
          const totalCredit = deposit.amount + bonus;
          turnoverReq = totalCredit * appliedTurnoverMult;

          await updateDoc(doc(db, "users", deposit.userId), { 
            balance: increment(totalCredit),
            remainingTurnover: increment(turnoverReq),
            depositCount: increment(1)
          });
        } else {
          // No bonus, just 1x turnover
          await updateDoc(doc(db, "users", deposit.userId), { 
            balance: increment(deposit.amount),
            remainingTurnover: increment(deposit.amount), // 1x turnover
            depositCount: increment(1)
          });
        }

        // Create Notification
        await addDoc(collection(db, "notifications"), {
          userId: deposit.userId,
          title: "Deposit Approved",
          message: `Your deposit of ৳${deposit.amount} has been approved.${bonus > 0 ? ` Bonus: ৳${bonus} added!` : ""}`,
          type: "success",
          read: false,
          createdAt: new Date().toISOString()
        });

        await updateDoc(doc(db, "deposits", deposit.id), { 
          status: "approved", 
          approvedAt: new Date().toISOString(),
          appliedBonusPercent,
          turnoverReq
        });

      } else {
        await updateDoc(doc(db, "deposits", deposit.id), { status: "rejected", rejectedAt: new Date().toISOString() });
        
        // Create Notification
        await addDoc(collection(db, "notifications"), {
          userId: deposit.userId,
          title: "Deposit Rejected",
          message: `Your deposit of ৳${deposit.amount} has been rejected. Please contact support if you think this is a mistake.`,
          type: "error",
          read: false,
          createdAt: new Date().toISOString()
        });
      }
      fetchData(); // Refresh
    } catch (error) {
      console.error("Error updating deposit:", error);
    }
  };

  const handleWithdrawAction = async (id: string, userId: string, amount: number, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await updateDoc(doc(db, "withdrawals", id), { status: "approved", approvedAt: new Date().toISOString() });
        await updateDoc(doc(db, "users", userId), { balance: increment(-amount) });
      } else {
        await updateDoc(doc(db, "withdrawals", id), { status: "rejected", rejectedAt: new Date().toISOString() });
      }
      fetchData();
    } catch (error) {
      console.error("Error updating withdrawal:", error);
    }
  };

  const addNumber = async () => {
    const number = prompt("Enter Number:");
    const type = prompt("Enter Type (bkash/nagad/rocket):");
    if (number && type) {
      await addDoc(collection(db, "payment_numbers"), { number, type, active: true });
      fetchData();
    }
  };

  const deleteNumber = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, "payment_numbers", id));
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Finance & Wallet</h2>
        <p className="text-gray-400">Manage deposits, withdrawals, and payment settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        {["deposits", "withdrawals", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              activeTab === tab 
                ? "bg-yellow-500 text-black" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 min-h-[500px]">
        
        {activeTab === "deposits" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Pending Deposits</h3>
            {loading ? <p className="text-gray-500">Loading...</p> : deposits.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{dep.senderNumber}</span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 uppercase">{dep.method}</span>
                    {dep.wantsBonus === false && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">No Bonus</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    TrxID: <span className="text-white font-mono">{dep.trxId}</span> • {new Date(dep.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-green-500">৳{dep.amount}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDepositAction(dep, "approve")}
                      className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDepositAction(dep, "reject")}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && deposits.length === 0 && <p className="text-gray-500 text-center py-10">No pending deposits</p>}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Pending Withdrawals</h3>
            {loading ? <p className="text-gray-500">Loading...</p> : withdraws.map((wd) => (
              <div key={wd.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{wd.walletNumber}</span>
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400 uppercase">{wd.method}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Requested at {new Date(wd.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-orange-500">৳{wd.amount}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleWithdrawAction(wd.id, wd.userId, wd.amount, "approve")}
                      className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleWithdrawAction(wd.id, wd.userId, wd.amount, "reject")}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
             {!loading && withdraws.length === 0 && <p className="text-gray-500 text-center py-10">No pending withdrawals</p>}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            
            {/* Bonus & Turnover Settings */}
            <div className="bg-black/30 p-6 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Bonus & Turnover Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 1st Deposit */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-yellow-500 mb-3">1st Deposit</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Bonus (%)</label>
                      <input 
                        type="number" 
                        value={firstDepositBonus}
                        onChange={(e) => setFirstDepositBonus(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Turnover (x)</label>
                      <input 
                        type="number" 
                        value={firstDepositTurnover}
                        onChange={(e) => setFirstDepositTurnover(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2nd Deposit */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-yellow-500 mb-3">2nd Deposit</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Bonus (%)</label>
                      <input 
                        type="number" 
                        value={secondDepositBonus}
                        onChange={(e) => setSecondDepositBonus(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Turnover (x)</label>
                      <input 
                        type="number" 
                        value={secondDepositTurnover}
                        onChange={(e) => setSecondDepositTurnover(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3rd Deposit */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-yellow-500 mb-3">3rd Deposit</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Bonus (%)</label>
                      <input 
                        type="number" 
                        value={thirdDepositBonus}
                        onChange={(e) => setThirdDepositBonus(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Turnover (x)</label>
                      <input 
                        type="number" 
                        value={thirdDepositTurnover}
                        onChange={(e) => setThirdDepositTurnover(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Global / Fallback */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-gray-400 mb-3">Default / Special</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Turnover (x)</label>
                      <input 
                        type="number" 
                        value={turnoverMultiplier}
                        onChange={(e) => setTurnoverMultiplier(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Used for Special Offers</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={saveSettings}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>

            {/* Payment Numbers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Payment Numbers</h3>
                <button 
                  onClick={addNumber}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-black rounded-lg text-sm font-bold hover:bg-yellow-400"
                >
                  <Plus className="w-4 h-4" /> Add Number
                </button>
              </div>
              <div className="space-y-3">
                {numbers.map((num) => (
                  <div key={num.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        num.type === 'bkash' ? 'bg-pink-600' : 'bg-orange-600'
                      }`}>
                        {num.type[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-mono text-lg text-white">{num.number}</p>
                        <p className="text-xs text-gray-500">Personal • {num.active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-gray-400 hover:text-white">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteNumber(num.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Webhook Config */}
            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-bold text-white mb-4">Auto-Deposit Configuration (SMS Webhook)</h3>
              <div className="bg-black/30 p-6 rounded-xl border border-white/10">
                <p className="text-gray-400 mb-4 text-sm">
                  Use this Secret Key in your &quot;SMS to URL&quot; app. The webhook URL is: <br/>
                  <code className="text-yellow-500">https://bengalbet.com/api/sms-webhook</code>
                </p>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-gray-300">
                    {smsKey}
                  </div>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
