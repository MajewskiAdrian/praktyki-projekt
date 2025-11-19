"use client";
import { useState } from "react";

type Props = {
  className?: string;
};

export default function LogoutButton({ className }: Props) {
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
      className={
        className ??
        ""
      }
      aria-disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
