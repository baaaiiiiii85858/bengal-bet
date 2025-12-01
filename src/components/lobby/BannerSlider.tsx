"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const banners = [
  { id: 1, color: "bg-linear-to-r from-purple-600 to-blue-600", title: "Welcome Bonus 100%" },
  { id: 2, color: "bg-linear-to-r from-red-600 to-orange-600", title: "New Slots Available" },
  { id: 3, color: "bg-linear-to-r from-emerald-600 to-teal-600", title: "Refer & Earn" },
];

export function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-21/9 overflow-hidden rounded-xl my-4">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className={cn("w-full h-full shrink-0 flex items-center justify-center p-6", banner.color)}
          >
            <h2 className="text-2xl font-bold text-white drop-shadow-md">{banner.title}</h2>
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              current === idx ? "bg-white" : "bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
