"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import CourseCard from "@/components/courseCard";

interface Course {
  _id: string;
  title: string;
  target: string;
  thread_id: string;
  progress: [number, number];
  status: "In Progress" | "completed";
}

export default function CoursesPage() {
  const router = useRouter();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(myCourses.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentCourses = myCourses.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  useEffect(() => {
    // Fetch user's courses from an API or state management here
    // For now, we use dummy data
    const fetchMyCourses = async () => {
      try {
        const response = await axiosInstance.get('/courses/my_courses');
        setMyCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 px-6 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h1 className="text-2xl text-white">My Courses</h1>
        <button 
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors cursor-pointer"
          onClick={() => router.push("/CreateCourse")}
          >
          Create Course +
        </button>
      </div>

      {/* Courses Grid */}
      <div className="w-full max-w-6xl grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-center justify-items-center my-6">
        {currentCourses.map((course) => (
          <CourseCard
            key={course._id}
            title={course.title}
            target={course.target}
            status={course.status}
            setCourses={setMyCourses}
            courseId={course._id}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
