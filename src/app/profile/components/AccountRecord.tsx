"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  createdAt: string;
  method: string;
}

export function AccountRecord() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch Deposits
        const depQ = query(
          collection(db, "deposits"), 
          where("userId", "==", user.id),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const depSnap = await getDocs(depQ);
        const deposits = depSnap.docs.map(doc => ({
          id: doc.id,
          type: 'deposit',
          ...doc.data()
        })) as Transaction[];

        // Fetch Withdrawals
        const wdQ = query(
          collection(db, "withdrawals"), 
          where("userId", "==", user.id),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const wdSnap = await getDocs(wdQ);
        const withdrawals = wdSnap.docs.map(doc => ({
          id: doc.id,
          type: 'withdrawal',
          ...doc.data()
        })) as Transaction[];

        // Merge and Sort
        const allTx = [...deposits, ...withdrawals].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTransactions(allTx);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) return <div className="text-center p-8 text-gray-500">Loading records...</div>;

  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <div className="text-center p-8 text-gray-500 bg-slate-800/50 rounded-xl border border-slate-700">
          No transactions found
        </div>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-white capitalize">{tx.type}</p>
                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${
                tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'
              }`}>
                {tx.type === 'deposit' ? '+' : '-'}৳{tx.amount}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1">
                {tx.status === 'approved' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Success</span>}
                {tx.status === 'pending' && <span className="text-xs text-yellow-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
                {tx.status === 'rejected' && <span className="text-xs text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
