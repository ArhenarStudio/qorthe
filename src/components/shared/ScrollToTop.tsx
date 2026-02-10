"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  isDarkMode: boolean;
}

export function ScrollToTop({ isDarkMode }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtFooter, setIsAtFooter] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ left: 0, bottom: 0 });

  useEffect(() => {
    const calculatePosition = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      const distanceFromBottom = documentHeight - (scrollY + windowHeight);

      if (distanceFromBottom < 400 && scrollY > 300) {
        setIsAtFooter(true);

        const copyrightElement = document.getElementById("footer-copyright");
        if (copyrightElement) {
          const rect = copyrightElement.getBoundingClientRect();
          const leftPosition = rect.left - 40;
          const bottomPosition =
            window.innerHeight - rect.top - rect.height / 2 - 16;

          setButtonPosition({
            left: leftPosition,
            bottom: bottomPosition,
          });
        }
      } else {
        setIsAtFooter(false);
      }
    };

    calculatePosition();
    window.addEventListener("scroll", calculatePosition);
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      style={
        isAtFooter
          ? { left: `${buttonPosition.left}px`, bottom: `${buttonPosition.bottom}px` }
          : undefined
      }
      className={`fixed z-50 transition-all duration-300 hover:scale-110 ${
        isAtFooter
          ? "rounded-lg p-2"
          : "bottom-8 left-8 rounded-full p-3 shadow-lg"
      } ${
        isDarkMode
          ? isAtFooter
            ? "bg-[#2d2419] text-[#8b6f47] hover:bg-[#8b6f47] hover:text-white"
            : "bg-[#8b6f47] text-white hover:bg-[#a0835a]"
          : isAtFooter
            ? "bg-gray-100 text-[#8b6f47] hover:bg-[#8b6f47] hover:text-white"
            : "bg-[#8b6f47] text-white hover:bg-[#a0835a]"
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className={isAtFooter ? "h-4 w-4" : "h-5 w-5"} />
    </button>
  );
}
