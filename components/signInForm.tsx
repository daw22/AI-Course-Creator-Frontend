"use client";
import React, { useState } from "react";
import axiosInstance, {setAuthToken} from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import useUserStore from "@/state/user";
import usePortalStore from "@/state/portal";
import { access } from "fs";

export default function SignInForm() {
  const router = useRouter();
  const close = usePortalStore((state) => state.closePortal);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<Boolean>(false);
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const logInHandler = async (e: any, formData: { username: string; password: string }) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", formData.username);
    data.append("password", formData.password);
    const setUser  = useUserStore.getState().setUser;
    try {
      const response = await axiosInstance.post("/auth/token", data);
      const profile = response.data.profile;
      setUser({
        firstName: profile.first_name, 
        lastName: profile.last_name, 
        id: profile.user_id, 
        threadIds: profile.thread_ids, 
        courses: profile.courses,
        accessToken: response.data.access_token
      });
      // navigate to CreateCourse
      router.push("/CreateCourse");
      // set auth token
      setAuthToken(response.data.access_token);
      //close modal
      close();
      setError(false);
    } catch (error) {
      setError(true);
    }
};

  return (
    <form onSubmit={(e) => logInHandler(e, formData)} className="space-y-4">
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 font-light text-sm focus:outline-none focus:border-white transition-colors"
      />
      {error && (
        <p className="text-red-500 text-sm">Invalid username or password.</p>
      )}
      <button
        type="submit"
        className="w-full py-3 border border-white text-white font-light text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 ease-out active:scale-95 mt-6"
      >
        Sign In
      </button>
    </form>
  );
}
