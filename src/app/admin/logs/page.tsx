"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function LogsPage() {
  const [logs] = useState([
    { id: 1, user: "Rahim", game: "Crash", amount: 100, result: "win", payout: 200, time: "10:30:45 AM" },
    { id: 2, user: "Karim", game: "Slots", amount: 50, result: "loss", payout: 0, time: "10:31:12 AM" },
    { id: 3, user: "Rahim", game: "Dice", amount: 20, result: "win", payout: 40, time: "10:32:00 AM" },
    { id: 4, user: "Jamal", game: "Roulette", amount: 500, result: "loss", payout: 0, time: "10:35:22 AM" },
  ]);

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
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400 font-mono text-sm">{log.time}</td>
                <td className="p-4 font-medium text-white">{log.user}</td>
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
                  ৳{log.payout}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
