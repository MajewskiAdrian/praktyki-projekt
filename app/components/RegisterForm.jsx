"use client";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  // Keep a stable shape so inputs stay controlled for component lifetime
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); // message text
  const [statusType, setStatusType] = useState(""); // "success" | "error"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    try {
      // simple client-side validation
      if (formData.password !== formData.confirmPassword) {
        setStatusType("error");
        setStatusMsg("Passwords do not match");
        return;
      }

      setIsSubmitting(true);
      setStatusMsg("");
      setStatusType("");

      const payload = {
        name: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          body?.error ||
          body?.message ||
          res.statusText ||
          "Registration failed";
        setStatusType("error");
        setStatusMsg(msg);
      } else {
        setStatusType("success");
        setStatusMsg("Registered successfully");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setStatusType("error");
      setStatusMsg("Network error occurred - please try again later");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        className="border-2 p-3 border-gray-500 rounded-[1.20rem] text-gray-800 focus:border-blue-500 focus:bg-gray-200 outline-none transition-all duration-400"
      />
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
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
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
          {statusMsg + ". "}
          {statusType === "success" && (
            <Link href="/login" className="text-blue-500 hover:text-blue-700">
              Login now
            </Link>
          )}
        </div>
      )}
      <button
        type="submit"
        className="bg-blue-500 text-white p-3 rounded-[1.20rem] hover:bg-blue-600 transition-colors duration-200"
      >
        {isSubmitting ? "Sending..." : "Register"}
      </button>

      <p className="text-center text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-700">
          Login here
        </Link>
      </p>
    </form>
  );
}
