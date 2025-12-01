"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Flame, Gamepad2, Dices, Fish } from "lucide-react";

const categories = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "slots", label: "Slots", icon: Gamepad2 },
  { id: "table", label: "Table", icon: Dices },
  { id: "fishing", label: "Fishing", icon: Fish },
];

const games = [
  { id: 1, title: "Golden Empire", category: "hot", image: "bg-yellow-600" },
  { id: 2, title: "Fortune Gems", category: "hot", image: "bg-purple-600" },
  { id: 3, title: "Super Ace", category: "slots", image: "bg-blue-600" },
  { id: 4, title: "Money Coming", category: "slots", image: "bg-green-600" },
  { id: 5, title: "Poker King", category: "table", image: "bg-red-600" },
  { id: 6, title: "Fishing War", category: "fishing", image: "bg-cyan-600" },
  // Duplicates for grid filling
  { id: 7, title: "Lucky God", category: "slots", image: "bg-orange-600" },
  { id: 8, title: "Roma X", category: "hot", image: "bg-rose-600" },
];

export function GameGrid() {
  const [activeTab, setActiveTab] = useState("hot");

  const filteredGames = activeTab === "hot" 
    ? games.filter(g => g.category === "hot" || g.id < 5) // Show mix for hot
    : games.filter(g => g.category === activeTab);

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors",
                activeTab === cat.id 
                  ? "bg-gold text-slate-900 font-bold" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredGames.map((game) => (
          <Link 
            key={game.id} 
            href={`/game/${game.id}`}
            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 hover:ring-2 hover:ring-gold transition-all"
          >
            <div className={cn("absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity", game.image)} />
            <div className="absolute inset-0 flex items-end p-3 bg-linear-to-t from-black/80 to-transparent">
              <span className="text-white font-bold text-sm">{game.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
