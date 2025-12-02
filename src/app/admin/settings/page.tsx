"use client";

import { useState } from "react";
import { Bot, Power, Save } from "lucide-react";

export default function SettingsPage() {
  const [botEnabled, setBotEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">System Settings</h2>
        <p className="text-gray-400">Configure bot activity and site maintenance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bot Control */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Bot className="w-32 h-32 text-white" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-500" /> Bot Control
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Enable "Fake Activity" to simulate bets and wins on the frontend. This makes the site look busy.
            </p>

            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="font-medium text-white">Fake Activity Status</span>
              <button 
                onClick={() => setBotEnabled(!botEnabled)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  botEnabled ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  botEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <Power className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Power className="w-6 h-6 text-red-500" /> Maintenance Mode
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Turn off the entire site for maintenance. Users will see a "Under Maintenance" screen.
            </p>

            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="font-medium text-white">Maintenance Status</span>
              <button 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  maintenanceMode ? "bg-red-500" : "bg-gray-600"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  maintenanceMode ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
