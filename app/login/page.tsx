"use client";
import "@/app/ui/global.css";
import LoginForm from "@/app/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">

        <div className="flex justify-center">
          <Image 
            src="/logo.png" 
            alt="Venn Logo" 
            width={200} 
            height={90}
            priority
            unoptimized
          />
        </div>

        <LoginForm />
      </div>
    </main>
  );
}