"use client";
import { useState } from "react";

export default function RegisterForm() {
  // Keep a stable shape so inputs stay controlled for component lifetime
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
        console.error("Passwords do not match");
        return;
      }

      const payload = {
        // API expects `name` (not `username`)
        name: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Registration failed:", body?.error || res.statusText);
      } else {
        console.log("Registered successfully");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
      <button type="submit" className="bg-blue-500 text-white p-3 rounded-[1.20rem] hover:bg-blue-600 transition-colors duration-200">
        Register
      </button>
    </form>
  );
}
