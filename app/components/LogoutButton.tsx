"use client";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/logout", { method: "POST" });

      if (!res.ok) {
        console.error("Logout failed");
        setIsLoggingOut(false);
        return;
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      /*className="w-full text-left px-3 py-1 bg-transparent text-gray-50 cursor-pointer rounded disabled:opacity-50 focus:outline-none ease-in-out duration-300"*/
      aria-disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
