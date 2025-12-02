"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import StatsCard from "@/components/admin/StatsCard";
import { Users, ArrowDownToLine, ArrowUpFromLine, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Users Count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // Fetch Deposits
        const depositsSnapshot = await getDocs(collection(db, "deposits"));
        let totalDeposit = 0;
        depositsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === "approved" || data.status === "success") {
            totalDeposit += Number(data.amount || 0);
          }
        });

        // Fetch Withdrawals
        const withdrawalsSnapshot = await getDocs(collection(db, "withdrawals"));
        let totalWithdraw = 0;
        withdrawalsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === "approved" || data.status === "success") {
            totalWithdraw += Number(data.amount || 0);
          }
        });

        setStats({
          totalUsers,
          totalDeposit,
          totalWithdraw,
          netProfit: totalDeposit - totalWithdraw
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={loading ? "..." : stats.totalUsers} 
          icon={Users} 
          color="blue"
          trend="12%"
          trendUp={true}
        />
        <StatsCard 
          title="Total Deposit" 
          value={loading ? "..." : `৳${stats.totalDeposit}`} 
          icon={ArrowDownToLine} 
          color="green"
          trend="8%"
          trendUp={true}
        />
        <StatsCard 
          title="Total Withdraw" 
          value={loading ? "..." : `৳${stats.totalWithdraw}`} 
          icon={ArrowUpFromLine} 
          color="orange"
          trend="2%"
          trendUp={false}
        />
        <StatsCard 
          title="Net Profit" 
          value={loading ? "..." : `৳${stats.netProfit}`} 
          icon={DollarSign} 
          color="purple"
          trend="15%"
          trendUp={true}
        />
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Registrations</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                    U
                  </div>
                  <div>
                    <p className="text-white font-medium">New User {i}</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
          <div className="space-y-4">
             {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Deposit via Bkash</p>
                    <p className="text-xs text-gray-500">2 mins ago</p>
                  </div>
                </div>
                <span className="font-bold text-green-500">+৳500</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
