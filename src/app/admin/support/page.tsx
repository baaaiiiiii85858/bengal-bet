"use client";

import { MessageSquare, ExternalLink } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Support & Chat</h2>
        <p className="text-gray-400">Manage user inquiries and live chat.</p>
      </div>

      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-10 text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
          <MessageSquare className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4">Live Chat Integration</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          We recommend using a dedicated service like Tawk.to or Intercom for robust live chat functionality.
        </p>

        <a 
          href="https://dashboard.tawk.to" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors"
        >
          Open Chat Dashboard <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
