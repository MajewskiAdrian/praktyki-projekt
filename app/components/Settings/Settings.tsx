"use client";

import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import AccountPanel from "./AccountForm";
import DisplayPanel from "./DisplayForm";

const Nav = [
  { id: "profile", label: "Profile Settings", desc: "Update your personal information and change your password." },
  { id: "account", label: "Account Settings", desc: "Manage your account preferences and privacy settings." },
  { id: "display", label: "Display Settings", desc: "Customize the appearance of the application." },
];

export default function Settings() {
  const [active, setActive] = useState<string>("profile");

  return (
    <div className="h-screen bg-white shadow-md overflow-hidden flex mb-10 dark:bg-gray-800">
      {/* Sidebar */}

      <aside className="w-64 border-r bg-gray-50 p-4 sm:block flex flex-col dark:bg-gray-700">
        <h3 className="text-black font-semibold mb-4 dark:text-white">Settings</h3>
        <nav className="space-y-1 flex-1">
          {Nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left p-2 rounded-md flex flex-col ${active === item.id ? "bg-white shadow-sm text-black font-medium dark:bg-gray-500 dark:text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
            >
              <span>{item.label}</span>
              {item.desc && <span className="text-xs text-gray-800 dark:text-gray-200">{item.desc}</span>}
            </button>
          ))}
        </nav>
        <Link
          href="/"
          className="block mt-4 px-3 py-1.5 rounded-lg w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center dark:bg-gray-900"
        >
          ← Return
        </Link>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">
        {active === "profile" && <ProfileForm />}
        {active === "account" && <AccountPanel />}
        {active === "display" && <DisplayPanel />}
      </main>
    </div>
  );
}
