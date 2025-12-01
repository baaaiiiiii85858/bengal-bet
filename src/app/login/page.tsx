"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Phone, Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.target as HTMLFormElement);
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    try {
      await login(phone, password);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError("Invalid Phone or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-gold">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gold">Welcome Back</h1>
          <p className="text-slate-400">Sign in to continue to Bengal Slot</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input 
                type="tel" 
                placeholder="01xxxxxxxxx" 
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="gold" 
            className="w-full h-12 text-lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gold hover:underline font-medium">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
