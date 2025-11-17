"use client";
import React, { useState } from "react";

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Profile</h2>
      <p className="text-gray-800 mb-6 dark:text-gray-300">Update your public profile information.</p>

      <div className="space-y-4 max-w-2xl">
        <label className="block">
          <div className="text-gray-800 font-medium mb-1 dark:text-gray-200">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-gray-800 dark:text-gray-200" />
        </label>

        <label className="block">
          <div className="text-gray-800 font-medium mb-1 dark:text-gray-200">Username</div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded-md px-3 py-2 text-gray-800 dark:text-gray-200" />
        </label>

        <label className="block">
          <div className="text-gray-800 font-medium mb-1 dark:text-gray-200">Bio</div>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border rounded-md px-3 py-2 h-24 text-gray-800 dark:text-gray-200" />
        </label>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Save changes</button>
          <button className="px-4 py-2 bg-gray-400 rounded-md dark:bg-gray-600 dark:text-gray-200">Cancel</button>
        </div>
      </div>
    </section>
  );
}
