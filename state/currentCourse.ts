import { create } from "zustand";

type Course = {
  id: string;
  title: string;
  thread_id: string;
  progress: number[];
};

const useCurrentCoursesStore = create<{
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}>((set) => ({
  courses: [],
  setCourses: (courses: Course[]) => set({ courses }),
}));

export default useCurrentCoursesStore;