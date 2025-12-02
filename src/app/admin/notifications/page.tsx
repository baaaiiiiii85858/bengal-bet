"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Trash2, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const notifs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        createdAt: new Date().toISOString(),
        type: "global"
      });
      alert("Notification Sent!");
      setTitle("");
      setMessage("");
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Error sending notification");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification? It will be removed for all users.")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Error deleting notification");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Global Notifications</h2>
        <p className="text-gray-400">Send alerts and announcements to all users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Send Form */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-8 h-fit">
          <h3 className="text-xl font-bold text-white mb-6">Send New Notification</h3>
          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Special Bonus Tonight!"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={5}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-5 h-5" /> Send to All Users
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Notification History</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-gray-500 text-center">Loading history...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-500 text-center">No notifications sent yet.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{notif.title}</h4>
                      <p className="text-gray-400 text-sm mb-3">{notif.message}</p>
                      <div className="flex items-center text-xs text-gray-500 gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
