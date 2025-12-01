import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { AuthModal } from "@/components/auth/AuthModal";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 md:pb-0">
      <Header />
      <main className="max-w-md mx-auto min-h-screen bg-slate-950 shadow-2xl relative">
        {children}
      </main>
      <BottomNav />
      <AuthModal />
    </div>
  );
}
