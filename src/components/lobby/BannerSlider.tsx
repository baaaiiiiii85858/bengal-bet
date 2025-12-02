"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const banners = [
  { id: 1, image: "/banner1.jpg", alt: "Bengal Slot Welcome" },
  { id: 2, image: "/banner2.jpg", alt: "New Games" },
  { id: 3, image: "/banner3.jpg", alt: "Special Bonus" },
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
    <div className="relative w-full aspect-21/9 overflow-hidden rounded-xl my-4 shadow-lg border border-white/10">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="w-full h-full shrink-0 relative"
          >
            <Image 
              src={banner.image} 
              alt={banner.alt}
              fill
              className="object-cover"
              priority={banner.id === 1}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all shadow-sm",
              current === idx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}
