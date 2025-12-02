"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Wallet, 
  Users, 
  Share2, 
  FileText, 
  Bell, 
  Settings, 
  MessageSquare,
  LogOut
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Games", href: "/admin/games", icon: Gamepad2 },
  { name: "Finance", href: "/admin/finance", icon: Wallet },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Affiliate", href: "/admin/affiliate", icon: Share2 },
  { name: "Logs", href: "/admin/logs", icon: FileText },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Support", href: "/admin/support", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useUser();

  return (
    <div className="w-64 bg-[#1a1a2e] border-r border-white/10 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Bengal Admin
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
