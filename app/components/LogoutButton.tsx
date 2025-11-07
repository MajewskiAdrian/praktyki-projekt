"use client";
import { useState } from "react";

export default function LogoutButton() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true)
        const res = await fetch ("/api/logout", {
            method: "POST",
        })

        if (!res) {
            console.error("Logout failed")
            setIsLoggingOut(false)
        } else {
            // do dodania później, gdy będzie strona główna
            // window.location.href = "/";
            setIsLoggingOut(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-gray-500 text-gray-50 rounded hover:bg-gray-600 disabled:opacity-50 ease-in-out duration-300"
        >
            {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
    );
}