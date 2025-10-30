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
    quiz?: [
        { question: string; options: string[], answer: number}
    ];
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
    { question: string; options: string[], answer: number}
]
interface CourseState {
    course: Course | null;
    loadedChapters: Chapter[];
    loadingMessage: string | null;
    waitingForStream: boolean;
    nextToGenerate: [number, number] | null;
    setLoadingMessage: (message: string | null) => void;
    loadGeneratedContent: () => Promise<void>;
    currentContent: string,
    quiz: Quiz  | null,
    setCourse: (course: Course) => void;
    addSubtopic: (progress: [number, number]) => void;
    clearCourse: () => void;
    setCurrentContent: (content: string) => void;
    setQuiz: (quiz: Quiz | null) => void;
    setCourseProgress: (progress: [number, number]) => void;
    setNextToGenerate: (progress: [number, number] | null) => void;
    swapCurrentContent: (chapterIndex: number, subtopicIndex: number) => void;
    setWaitingForStream: (waiting: boolean) => void;
}

const useCurrentCourseStore = create<CourseState>((set, get) => ({
    course: null,
    loadedChapters: [],
    loadingMessage: null,
    waitingForStream: false,
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
            console.log("Loaded generated content:", response.data);
            set({loadedChapters: response.data.course_content});
            if (get().course && get().course?.progress && get().loadedChapters.length > 0) {
                const chapterIndex = get().course?.progress?.[0];
                const subtopicIndex = get().course?.progress?.[1];
                let content = "";
                if (typeof chapterIndex === "number" && typeof subtopicIndex === "number") {
                    const chapter = get().loadedChapters[chapterIndex];
                    content = chapter?.subtopics?.[subtopicIndex - 1]?.content ?? "";
                }
                set({currentContent: content});
                set({nextToGenerate: [chapterIndex ?? 0, subtopicIndex ?? 0]});
                if (get().loadedChapters[get().loadedChapters.length -1].quiz) {
                    console.log("Setting quiz for chapter:", get().loadedChapters[get().loadedChapters.length -1].quiz);
                    set({quiz: get().loadedChapters[get().loadedChapters.length -1].quiz});
                }
            }
        } else {
            set({loadingMessage: "Failed to load course content."});
        }
        get().setWaitingForStream(false);
    },
    addSubtopic: async (progress: [number, number]) => {
        get().loadGeneratedContent();
    },
    setQuiz: (quiz: Quiz | null) => {
        set(() => ({ quiz }));
    },
    setCurrentContent: (content: string) => {
        if (content == "<<<CLEAR>>>") {
            set(() => ({ currentContent: "" }));
            return;
        }
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
    swapCurrentContent: (chapterIndex: number, subtopicIndex: number) => {
        let content = "";
        const loadedChapters = get().loadedChapters;
        if (loadedChapters.length > 0) {
            const chapter = loadedChapters[chapterIndex];
            content = chapter?.subtopics?.[subtopicIndex]?.content ?? "";
        }
        set({currentContent: content});
    },
    setWaitingForStream: (waiting: boolean) => {
        set(() => ({ waitingForStream: waiting }));
    },
}));

export default useCurrentCourseStore;