"use client";
import React from "react";

export default function AccountForm() {
  return (
    <section>
      <h2 className="text-2xl text-black font-semibold mb-2 dark:text-gray-200">Account</h2>
      <p className="text-sm text-gray-600 mb-6 dark:text-gray-300">Email, password and active sessions.</p>

      <div className="space-y-6 max-w-2xl">
        <div className="p-4 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-black dark:text-gray-200">Change password</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Update your account password.</div>
            </div>
            <button className="px-3 py-1 text-black bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-200">Change</button>
          </div>
        </div>

        <div className="p-4 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-200">
          <div className="font-medium text-black dark:text-gray-200">Sessions</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">Sign out of other sessions.</div>
        </div>
      </div>
    </section>
  );
}
