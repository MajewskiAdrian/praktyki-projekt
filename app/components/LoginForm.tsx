"use client";
import { redirect } from 'next/dist/server/api-utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [user, setUser] = useState("null"); // dane użytkownika po zalogowaniu
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [statusMsg, setStatusMsg] = useState(""); // message text
  const [statusType, setStatusType] = useState(""); // "success" || "error"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e : any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg("");
    setStatusType("");

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setStatusType("error");
        setStatusMsg("Please enter both email and password");
        return;
      }

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setStatusType("error");
        setStatusMsg(data?.error || "Login failed");
        return;
      }

      const user = await res.json();
      setStatusType("success");
      setStatusMsg("Login successful!");
      console.log("User logged in:", user);
      router.push('/');
    } catch (error : any) {
      console.error(error);
      setStatusType("error");
      setStatusMsg(error.message || "An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="border-2 p-3 border-gray-500 rounded-[1.20rem] text-gray-800 focus:border-blue-500 focus:bg-gray-200 outline-none transition-all duration-400"
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="border-2 p-3 border-gray-500 rounded-[1.20rem] text-gray-800 focus:border-blue-500 focus:bg-gray-200 outline-none transition-all duration-400"
      />

      {/* status message */}
      {statusMsg && (
        <div
          role="status"
          className={`p-3 rounded text-sm ${
            statusType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {statusMsg}
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-500 text-white p-3 rounded-[1.20rem] hover:bg-blue-600 transition-colors duration-200"
      >
        {isSubmitting ? "Sending..." : "Login"}
      </button>

      <p className="text-center text-gray-600">
        Don't have an account yet?{" "}
        <Link href="/register" className="text-blue-500 hover:text-blue-700">
          Register here
        </Link>
      </p>

    </form>
  );
}