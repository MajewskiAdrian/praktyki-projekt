"use client";
import "@/app/ui/global.css";
import LoginForm from "@/app/components/LoginForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-300 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Login</h2>
        <LoginForm />
      </div>
    </main>
  );
}