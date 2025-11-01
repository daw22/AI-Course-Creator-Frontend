import React, { RefCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useCurrentCourseStore from "@/state/curentCourse";
import { Course as CourseCo } from "@/state/curentCourse";

interface Course {
  _id: string;
  title: string;
  target: string;
  thread_id: string;
  progress: [number, number];
  status: "In Progress" | "completed";
}

export default function CourseCard({ courseId, title, target, status, setCourses }: {
  courseId: string;
  title: string;
  target: string;
  status: "In Progress" | "completed";
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}) {
  const router = useRouter();
  const [clicked, setClicked] = React.useState(false);
  const setCourse = useCurrentCourseStore((state) => state.setCourse);
  const course = useCurrentCourseStore((state) => state.course);

  const truncatedTarget =
    target.length > 150 ? target.slice(0, 150) + "..." : target;
  
  const onDelete = async (e: React.MouseEvent) => {
    setCourses((prevCourses) => prevCourses.filter(course => course._id !== courseId));
    const response = await axiosInstance.delete(`/courses/${courseId}`);
    if (response.status === 200) {
      // show a toast or something
      
    }else {
      // if failed shoa toast and refresh the courses list
      const courses = await axiosInstance.get('/courses/my_courses');
      if (courses.status === 200) {
        setCourses(courses.data.courses);
      }
    }
    e.stopPropagation();
  };

  const handleCourseClick = async () => {
    setClicked(true);
    const response = await axiosInstance.get(`/courses/${courseId}`);
    if (response.status === 200) {
      let course: CourseCo = {
        courseId: response.data._id,
        title: response.data.title,
        target: response.data.target,
        outline: response.data.outline,
        threadId: response.data.thread_id,
        progress: response.data.progress,
      }
      setCourse(course);
      setTimeout(() => {
        console.log("saved course info:", course);
        router.push(`/CourseContent`);
      }, 500);
    }
    else {
      // show error toast
      setClicked(false);
    }
  };

  return (
    <div
      onClick={handleCourseClick}
      className={` bg-gray-900 text-gray-200 relative rounded-xl shadow-md p-4 w-full max-w-sm transition-transform hover:scale-[1.02] pointer`}
    >
      {/* Delete Icon */}
      <button
        onClick={(e) => onDelete(e)}
        className="absolute top-3 right-3 hover:opacity-80"
        title="Delete Course"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          stroke="#7c0303ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      {/* Title */}
      <h2 className="text-lg font-semibold text-blue-400 mb-2 pr-6">{title}</h2>

      {/* Description */}
      <p className="text-gray-500 text-sm mb-4">{truncatedTarget}</p>
      
        {/* Status Badge */}
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
          {status === "completed" ? "Completed" : "In Progress"}
          {clicked && <Loader2 className="inline-block ml-2 animate-spin" size={12} />}
        </span>
    </div>
  );
}
