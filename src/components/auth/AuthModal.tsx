"use client";

import { useState } from "react";
import { X, Phone, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUser } from "@/context/UserContext";

export function AuthModal() {
  const { authModalOpen, closeAuthModal, login, register } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (isLogin) {
        await login(phone, password);
      } else {
        // Simple validation for register
        if (!name || name.length < 3) {
          throw new Error("Name must be at least 3 characters");
        }
        if (!/^01\d{9}$/.test(phone)) {
          throw new Error("Phone number must be 11 digits starting with 01");
        }
        await register(name, phone, password);
      }
      closeAuthModal();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <button 
            onClick={closeAuthModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    name="name"
                    type="text" 
                    placeholder="Enter your name" 
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  name="phone"
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
                  name="password"
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
              {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-gold hover:underline font-medium"
            >
              {isLogin ? "Register Now" : "Login Here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
