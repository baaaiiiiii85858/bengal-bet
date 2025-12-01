"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const methods = [
  { id: "bkash", name: "bKash", color: "bg-pink-600" },
  { id: "nagad", name: "Nagad", color: "bg-orange-600" },
  { id: "rocket", name: "Rocket", color: "bg-purple-600" },
];

export default function WithdrawPage() {
  const [selectedMethod, setSelectedMethod] = useState(methods[0]);

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">Withdraw Money</h1>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
          <span className="text-slate-400">Available Balance</span>
          <span className="text-xl font-bold text-gold">৳ 500.00</span>
        </div>

        {/* Methods */}
        <div className="grid grid-cols-3 gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedMethod.id === method.id
                  ? "border-gold bg-slate-800"
                  : "border-slate-700 bg-slate-900 opacity-60"
              }`}
            >
              <div className={`w-full h-8 rounded mb-2 ${method.color}`} />
              <div className="text-xs font-bold text-white">{method.name}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Withdraw Amount</label>
            <Input type="number" placeholder="Min 500" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Your Wallet Number</label>
            <Input type="tel" placeholder="01xxxxxxxxx" />
          </div>

          <Button variant="gold" className="w-full h-12 text-lg font-bold">
            Request Withdraw
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
