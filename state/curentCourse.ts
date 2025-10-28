import { create } from "zustand";
import { CourseOutline } from "./creationState"
import axiosInstance from "@/utils/axiosInstance";

interface Subtopic {
    title: string;
    content: string;
    summary: string;
    order: number;
}

interface Chapter {
    chapter_title: string;
    chapter_order: number;
    subtopics: Subtopic[];
}

export interface Course {
    courseId: string;
    title: string;
    target: string;
    outline: CourseOutline;
    threadId: string;
    progress: [number, number];
}

export type Quiz = [
    { question: string; options: string[]}
]
interface CourseState {
    course: Course | null;
    loadedChapters: Chapter[];
    loadingMessage: string | null;
    nextToGenerate: [number, number] | null;
    setLoadingMessage: (message: string | null) => void;
    loadGeneratedContent: () => Promise<void>;
    currentContent: string,
    quiz: Quiz  | null,
    setCourse: (course: Course) => void;
    addSubtopic: (progress: [number, number]) => void;
    clearCourse: () => void;
    setCurrentContent: (content: string) => void;
    setQuiz: (quiz: Quiz) => void;
    setCourseProgress: (progress: [number, number]) => void;
    setNextToGenerate: (progress: [number, number] | null) => void;
}

const useCurrentCourseStore = create<CourseState>((set, get) => ({
    course: null,
    loadedChapters: [],
    loadingMessage: null,
    nextToGenerate: null,
    currentContent: "",
    quiz: null,
    setLoadingMessage: (message: string | null) => set(() => ({ loadingMessage: message })),
    setCourse: (course: Course) => {
        set(() => ({ course }));
    },
    clearCourse: () =>
        set(() => ({ course: null, loadedChapters: [] })),
    loadGeneratedContent: async () => {
        const response = await axiosInstance.get(`/courses/get_generated_content/${get().course?.courseId}`);
        if (response.status === 200) {
            set({loadedChapters: response.data.course_content});
            if (get().course && get().course?.progress && get().loadedChapters.length > 0) {
                const chapterIndex = get().course?.progress?.[0];
                const content =
                    (chapterIndex !== undefined && get().loadedChapters[chapterIndex]?.subtopics?.[0]?.content) ||
                    "";
                set({currentContent: content});
            }
        }else {
            set({loadingMessage: "Failed to load course content."});
        }
    },
    addSubtopic: async (progress: [number, number]) => {
        
    },
    setQuiz: (quiz: Quiz) => {
        set(() => ({ quiz }));
    },
    setCurrentContent: (content: string) => {
        // concatinate the current content
        set((state) => ({ currentContent: state.currentContent + content }));
    },
    setCourseProgress: (progress: [number, number]) => {
        set((state) => ({
            course: state.course ? { ...state.course, progress } : null,
        }));
    },
    setNextToGenerate: (progress: [number, number] | null) => {
        set(() => ({ nextToGenerate: progress }));
    },
}));

export default useCurrentCourseStore;