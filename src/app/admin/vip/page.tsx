"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Plus, Trash2, Trophy } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface VipLevel {
  id: number;
  name: string;
  turnoverRequired: number;
  levelUpBonus: number;
}

export default function AdminVipPage() {
  const [levels, setLevels] = useState<VipLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "vip"));
      if (docSnap.exists()) {
        setLevels(docSnap.data().levels || []);
      } else {
        // Default levels if none exist
        setLevels([
          { id: 1, name: "VIP 1", turnoverRequired: 5000, levelUpBonus: 100 },
          { id: 2, name: "VIP 2", turnoverRequired: 10000, levelUpBonus: 200 },
          { id: 3, name: "VIP 3", turnoverRequired: 25000, levelUpBonus: 500 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching VIP levels:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveLevels = async () => {
    try {
      await setDoc(doc(db, "settings", "vip"), { levels }, { merge: true });
      alert("VIP Levels saved successfully!");
    } catch (error) {
      console.error("Error saving levels:", error);
      alert("Failed to save levels");
    }
  };

  const addLevel = () => {
    const newId = levels.length > 0 ? Math.max(...levels.map(l => l.id)) + 1 : 1;
    setLevels([...levels, { id: newId, name: `VIP ${newId}`, turnoverRequired: 0, levelUpBonus: 0 }]);
  };

  const removeLevel = (id: number) => {
    setLevels(levels.filter(l => l.id !== id));
  };

  const updateLevel = (id: number, field: keyof VipLevel, value: string | number) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" /> VIP Management
        </h1>
        <button 
          onClick={saveLevels}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">VIP Levels Configuration</h3>
          <button 
            onClick={addLevel}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg font-bold flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Level
          </button>
        </div>

        <div className="space-y-4">
          {levels.map((level, index) => (
            <div key={level.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="md:col-span-1 flex justify-center items-center h-full">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-xs text-gray-400 mb-1">Level Name</label>
                <Input 
                  value={level.name}
                  onChange={(e) => updateLevel(level.id, "name", e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs text-gray-400 mb-1">Turnover Required (BDT)</label>
                <Input 
                  type="number"
                  value={level.turnoverRequired}
                  onChange={(e) => updateLevel(level.id, "turnoverRequired", Number(e.target.value))}
                  className="bg-black/50 border-white/10"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs text-gray-400 mb-1">Level Up Bonus (BDT)</label>
                <Input 
                  type="number"
                  value={level.levelUpBonus}
                  onChange={(e) => updateLevel(level.id, "levelUpBonus", Number(e.target.value))}
                  className="bg-black/50 border-white/10"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button 
                  onClick={() => removeLevel(level.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {levels.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No VIP levels configured. Click "Add Level" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
