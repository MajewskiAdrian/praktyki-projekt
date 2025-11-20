// components/Logo.tsx
import React from "react";

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className || ""}`}>
    {/* Ikona V-pinezka */}
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path
        d="M12 8 L26 8 L32 30 L38 8 L52 8 L36 56 L28 56 Z"
        fill="#f59e0b" // amber-500
      />
    </svg>

    {/* Napis VENN - pseudo-kaligrafia (żeby użyć prawdziwej czcionki, dodamy font w CSS) */}
    <span className="text-2xl font-500 text-amber-500 font-logo-script">
      Venn
    </span>
  </div>
);