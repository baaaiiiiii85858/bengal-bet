"use client";

import { useState, useEffect } from "react";
import { Save, Power, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const defaultGames = [
  { id: "slots", name: "Slots", winRatio: 70, status: "active" },
  { id: "crash", name: "Crash", winRatio: 60, status: "active" },
  { id: "fishing", name: "Fishing", winRatio: 50, status: "active" },
];

export default function GamesControl() {
  const [games, setGames] = useState(defaultGames);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const newGames = await Promise.all(defaultGames.map(async (game) => {
        const docRef = doc(db, "game_settings", game.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...game, ...docSnap.data() };
        }
        return game;
      }));
      setGames(newGames);
    } catch (error) {
      console.error("Error fetching game settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRatioChange = (id: string, newRatio: number) => {
    setGames(games.map(g => g.id === id ? { ...g, winRatio: newRatio } : g));
  };

  const toggleStatus = (id: string) => {
    setGames(games.map(g => g.id === id ? { ...g, status: g.status === "active" ? "maintenance" : "active" } : g));
  };

  const saveSettings = async (id: string) => {
    const game = games.find(g => g.id === id);
    if (!game) return;

    try {
      await setDoc(doc(db, "game_settings", id), {
        winRatio: game.winRatio,
        status: game.status
      });
      alert(`${game.name} settings saved!`);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Game Control</h2>
          <p className="text-gray-400">Manage win ratios and game availability.</p>
        </div>
        <button onClick={fetchSettings} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-500">Loading settings...</p> : games.map((game) => (
          <div key={game.id} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <h1 className="text-6xl font-black text-white">{game.name[0]}</h1>
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{game.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                    game.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {game.status.toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => toggleStatus(game.id)}
                  className={`p-3 rounded-xl transition-colors ${
                    game.status === "active" 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  }`}
                >
                  <Power className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Win Ratio (%)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={game.winRatio}
                      onChange={(e) => handleRatioChange(game.id, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <span className="text-xl font-bold text-yellow-500 w-12">{game.winRatio}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Higher ratio = User wins more often.
                  </p>
                </div>

                <button 
                  onClick={() => saveSettings(game.id)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
