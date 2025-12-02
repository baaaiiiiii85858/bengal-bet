"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { UserData } from "@/context/UserContext";

interface UserStats {
  id: string;
  name: string;
  phone: string;
  totalDeposit: number;
  totalWithdraw: number;
  balance: number;
  netLoss: number; // Positive = Admin Profit, Negative = Admin Loss
}

export default function LeaderboardPage() {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));

        // 2. Fetch Approved Deposits
        const depositsSnap = await getDocs(query(collection(db, "deposits"), where("status", "==", "approved")));
        const deposits = depositsSnap.docs.map(doc => doc.data());

        // 3. Fetch Approved Withdrawals
        const withdrawalsSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "approved")));
        const withdrawals = withdrawalsSnap.docs.map(doc => doc.data());

        // 4. Calculate Stats
        const calculatedStats = users.map(user => {
          const userDeposits = deposits
            .filter(d => d.userId === user.id)
            .reduce((sum, d) => sum + Number(d.amount), 0);

          const userWithdrawals = withdrawals
            .filter(w => w.userId === user.id)
            .reduce((sum, w) => sum + Number(w.amount), 0);

          const balance = user.balance || 0;
          
          // Net Loss = Total Deposit - Total Withdraw - Current Balance
          // If result is positive, user lost money (Admin Profit)
          // If result is negative, user won money (Admin Loss)
          const netLoss = userDeposits - userWithdrawals - balance;

          return {
            id: user.id,
            name: user.name || "Unknown",
            phone: user.phone || "N/A",
            totalDeposit: userDeposits,
            totalWithdraw: userWithdrawals,
            balance,
            netLoss
          };
        });

        // 5. Sort by Net Loss (Descending) -> Highest Losers (Admin Profit) first
        calculatedStats.sort((a, b) => b.netLoss - a.netLoss);

        setStats(calculatedStats);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStats = stats.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Leaderboard</h2>
          <p className="text-gray-400">Ranking users by Net Loss (Admin Profit).</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search user..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">User</th>
              <th className="p-4 text-right">Total Deposit</th>
              <th className="p-4 text-right">Total Withdraw</th>
              <th className="p-4 text-right">Current Balance</th>
              <th className="p-4 text-right">Net Loss (Profit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading data...</td></tr>
            ) : filteredStats.length > 0 ? (
              filteredStats.map((stat, index) => (
                <tr key={stat.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-400 font-mono">#{index + 1}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{stat.name}</div>
                    <div className="text-xs text-gray-500">{stat.phone}</div>
                  </td>
                  <td className="p-4 text-right text-green-400">৳{stat.totalDeposit.toFixed(2)}</td>
                  <td className="p-4 text-right text-red-400">৳{stat.totalWithdraw.toFixed(2)}</td>
                  <td className="p-4 text-right text-yellow-400">৳{stat.balance.toFixed(2)}</td>
                  <td className={`p-4 text-right font-bold ${stat.netLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    <div className="flex items-center justify-end gap-1">
                      {stat.netLoss >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      ৳{Math.abs(stat.netLoss).toFixed(2)}
                    </div>
                    <div className="text-[10px] font-normal opacity-70">
                      {stat.netLoss >= 0 ? "Admin Profit" : "Admin Loss"}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
