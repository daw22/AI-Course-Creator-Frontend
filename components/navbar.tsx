"use client";

import Link from "next/link"; 
import { useState } from "react";
import useUserStore from "@/state/user";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import usePortalStore from "@/state/portal";

export default function NavBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const open = usePortalStore((state) => state.openPortal);

  const handleSignOut = async () => {
    const clearUser = useUserStore.getState().clearUser;
    try {
      // Optionally, you can also clear the auth token from axiosInstance here
      const response = await axiosInstance.post("/auth/logout");
      clearUser();
      console.log("Signed out successfully:", response.data);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }
  return (
    <nav className="w-full fixed top-0 left-0 z-50 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-semibold text-white hover:text-blue-400 transition"
          >
            AI Course Creator
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {user && <Link
              href="/MyCourses"
              className="hover:text-blue-400 transition"
            >
              My Courses
            </Link>}

            {user ? (
              <button 
                onClick={() => handleSignOut()}
              className="hover:text-blue-400 transition cursor-pointer">
                Sign out
              </button>
            ) : (
              <button onClick={() => open("signIn")} className="hover:text-blue-400 transition">
                Sign in
              </button>
            )}

            {!user && (
              <button
                onClick={() => open("signUp")}
                className="hover:text-blue-400 transition"
              >
                Sign up
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#111]/90 text-center py-4 space-y-3">
          <Link
            href="/my-courses"
            onClick={() => setIsOpen(false)}
            className="block hover:text-blue-400 transition"
          >
            My Courses
          </Link>

          {user ? (
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full hover:text-blue-400 transition"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/signin"
              onClick={() => setIsOpen(false)}
              className="block hover:text-blue-400 transition"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
