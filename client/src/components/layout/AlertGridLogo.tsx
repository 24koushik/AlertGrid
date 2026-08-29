import React from "react";
import { Grid3X3 } from "lucide-react";

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  theme?: "dark" | "light";
}

export function AlertGridLogo({
  className = "text-xl",
  showIcon = true,
  theme = "light",
}: LogoProps) {
  const isDark = theme === "dark";
  return (
    <div
      className={`flex items-center font-extrabold tracking-tighter select-none ${className}`}
    >
      {showIcon && (
        <div className="mr-2 relative flex items-center justify-center">
          <Grid3X3
            className={`w-[1.2em] h-[1.2em] ${isDark ? "text-white" : "text-slate-800"}`}
            strokeWidth={2.5}
          />
          <div
            className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 animate-pulse ${isDark ? "border-slate-900" : "border-white"}`}
          ></div>
        </div>
      )}
      <span
        className={`${isDark ? "text-white" : "text-slate-900"} drop-shadow-sm`}
      >
        Alert
      </span>
      <span className="text-blue-500 drop-shadow-sm">Grid</span>
    </div>
  );
}
