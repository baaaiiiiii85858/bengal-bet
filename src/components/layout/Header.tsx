"use client";

import { Bell, Wallet, X } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export function Header() {
  const { balance, user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "notifications"), 
          where("userId", "==", user.id), // Filter by user ID
          orderBy("createdAt", "desc"), 
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const notifs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        setNotifications(notifs);
        if (notifs.length > 0) setHasUnread(true);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [user]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false); // Mark as read when opened
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto relative">
        <div className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <Image 
              src="/logo.png" 
              alt="Bengal Slot" 
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-white text-lg">Bengal Slot</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-gold font-bold text-sm">৳ {balance.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={toggleNotifications}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Bell className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
            )}
          </button>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-16 right-4 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
              <h3 className="font-bold text-white">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <h4 className="font-bold text-white text-sm mb-1">{notif.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{notif.message}</p>
                    <span className="text-slate-600 text-[10px] mt-2 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
