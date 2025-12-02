"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Phone, Lock, User } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    // Simple validation
    if (!name || name.length < 3) {
      setError("Name must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (!/^01\d{9}$/.test(phone)) {
      setError("Phone number must be 11 digits starting with 01");
      setLoading(false);
      return;
    }

    try {
      await register(name, phone, password);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration Failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gold">Create Account</h1>
          <p className="text-slate-400">Join Bengal Slot today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:underline font-medium">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
