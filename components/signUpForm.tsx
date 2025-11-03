"use client";

import React, { useState } from "react";
import usePortalStore from "@/state/portal";
import useUserStore from "@/state/user";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";

export default function SignUpForm() {
  const open = usePortalStore((state) => state.openPortal);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // reset error
    setError(null);
    setLoading(true);
    // check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    // If passwords match, proceed with sign-up
    try{
      const response = await axiosInstance.post("/auth/signup", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });
      // open sign in modal after successful sign up
      open("signIn");
    } catch (error: any) {
        console.error("Error signing up:", error);
        setError(error.response?.data?.detail || "Sign up failed");
        setLoading(false);
        return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
        />
      </div>

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
      />

      {/* Username */}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
      />

      {/* Password */}
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
      />

      {/* Confirm Password */}
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 border border-white text-white font-light text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 ease-out active:scale-95 mt-6"
      >
        Sign Up {loading ? <Loader2 className="inline-block ml-2 animate-spin" size={12} /> : null}
      </button>
    </form>
  );
}



