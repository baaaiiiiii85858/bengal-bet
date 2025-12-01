"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, Check } from "lucide-react";

const methods = [
  { id: "bkash", name: "bKash", color: "bg-pink-600", number: "01700000000" },
  { id: "nagad", name: "Nagad", color: "bg-orange-600", number: "01800000000" },
  { id: "rocket", name: "Rocket", color: "bg-purple-600", number: "01900000000" },
];

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState(methods[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedMethod.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-white">Deposit Money</h1>

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

        {/* Admin Number */}
        <div className="bg-slate-800 p-4 rounded-xl space-y-2 border border-slate-700">
          <label className="text-sm text-slate-400">Send Money to this Number</label>
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
            <span className="font-mono text-lg font-bold text-gold">{selectedMethod.number}</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-white">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            * Only Send Money / Cash Out allowed. No Mobile Recharge.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Amount</label>
            <Input type="number" placeholder="Min 500" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Sender Number</label>
            <Input type="tel" placeholder="01xxxxxxxxx" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Transaction ID</label>
            <Input type="text" placeholder="8N7..." />
          </div>

          <Button variant="gold" className="w-full h-12 text-lg font-bold">
            Submit Deposit
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
