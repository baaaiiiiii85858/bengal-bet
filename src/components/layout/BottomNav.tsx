"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    label: "Referral",
    href: "/affiliate",
    icon: Users,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-gold" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
