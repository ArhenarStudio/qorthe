"use client";

import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0a0806] animate-fade-out">
      <div className="space-y-6 text-center">
        <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
          <span className="font-bold">DavidSon´s</span>{" "}
          <span className="font-normal">Design</span>
        </h1>
        <div className="flex justify-center gap-2">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-[#8b6f47]"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-[#8b6f47]"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-[#8b6f47]"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
