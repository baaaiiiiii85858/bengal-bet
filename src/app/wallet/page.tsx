"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const transactions = [
  { id: 1, type: "deposit", amount: 500, status: "success", date: "2024-03-20" },
  { id: 2, type: "withdraw", amount: 200, status: "pending", date: "2024-03-19" },
  { id: 3, type: "deposit", amount: 1000, status: "success", date: "2024-03-18" },
];

export default function WalletPage() {
  const { balance } = useUser();

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-4 space-y-6">
          {/* Balance Card */}
          <div className="bg-linear-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-lg text-center space-y-2">
            <span className="text-slate-400 text-sm">Total Balance</span>
            <h1 className="text-4xl font-bold text-gold">৳ {balance.toFixed(2)}</h1>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wallet/deposit" className="w-full">
              <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 space-x-2">
                <ArrowDownLeft className="w-5 h-5" />
                <span>Deposit</span>
              </Button>
            </Link>
            <Link href="/wallet/withdraw" className="w-full">
              <Button className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 space-x-2">
                <ArrowUpRight className="w-5 h-5" />
                <span>Withdraw</span>
              </Button>
            </Link>
          </div>

          {/* History */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-400">
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">Recent Transactions</span>
            </div>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "deposit" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {tx.type === "deposit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium capitalize text-white">{tx.type}</div>
                      <div className="text-xs text-slate-400">{tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      tx.type === "deposit" ? "text-green-500" : "text-red-500"
                    }`}>
                      {tx.type === "deposit" ? "+" : "-"}৳ {tx.amount}
                    </div>
                    <div className={`text-xs capitalize ${
                      tx.status === "success" ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
