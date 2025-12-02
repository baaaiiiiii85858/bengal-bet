"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

interface BetLog {
  id: string;
  username: string;
  game: string;
  amount: number;
  result: "win" | "loss";
  payout: number;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<BetLog[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "bets"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BetLog[];
      setLogs(fetchedLogs);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Betting Logs</h2>
          <p className="text-gray-400">Real-time history of all bets placed.</p>
        </div>
        <div className="flex gap-4">
          <button className="p-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-gray-400 hover:text-white">
            <Filter className="w-5 h-5" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-10 pr-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">User</th>
              <th className="p-4">Game</th>
              <th className="p-4">Bet Amount</th>
              <th className="p-4">Result</th>
              <th className="p-4 text-right">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-sm">{formatTime(log.createdAt)}</td>
                  <td className="p-4 font-medium text-white">{log.username || "Unknown"}</td>
                  <td className="p-4 text-yellow-500">{log.game}</td>
                  <td className="p-4 text-white">৳{log.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      log.result === "win" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {log.result}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${
                    log.payout > 0 ? "text-green-500" : "text-gray-500"
                  }`}>
                    ৳{log.payout.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No bets recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
