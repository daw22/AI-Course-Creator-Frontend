import { create } from "zustand";
import useUserStore from "./user";

export interface Question {
    question: string;
    choices: string[];
}

type CourseTarget = {
    targets: string[];
    recommended: number
}

type CourseOutline = {
    chapter_title: string;
    chapter_number: number;
    chapter_target?: string;
    subtopics: {
        subtopic_title: string;
        subtopic_target?: string;
    }[];
}[];

type CreationState = {
    currentState: string;
    threadId: string | null;
    currentChatDisplay: string | null;
    loadingMessage: string | null;
    messageCount: number;
    prerequisteQuestions: Question[];
    prerequisitesAnswers: Map<number, string>
    courseTargets: CourseTarget | null;
    selectedTarget: number | null;
    courseTitle: string | null;
    courseOutline: CourseOutline | null;
    rewindToStep: number | null;
    //actions
    setCurrentChatDisplay: (message: string) => void;
    setLoadingMessage: (message: string | null) => void;
    setCurrentState: (state: string) => void;
    setThreadId: (id: string) => void;
    setPrerequisiteQuestions: (questions: Question[]) => void;
    setCourseTitle: (title: string) => void;
    addAnswer: (index: number, answer: string) => void;
    setCourseTargets: (targets: CourseTarget) => void;
    setSelectedTarget: (index: number) => void;
    setCourseOutline: (outline: CourseOutline) => void;
    incrementMessageCount: () => void;
    setRewindToStep: (step: number | null) => void;
    reset: () => void;
}

const useCreationStore = create<CreationState>((set, get, store) => ({
    currentState: "title",
    threadId: null,
    currentChatDisplay: `Hey ${useUserStore.getState().user?.firstName || ''}, What would you like to learn about today?`,
    loadingMessage: null,
    messageCount: 0,
    prerequisteQuestions: [],
    prerequisitesAnswers: new Map(),
    courseTargets: null,
    courseOutline: null,
    courseTitle: null,
    selectedTarget: null,
    rewindToStep: null,
    //actions
    setCurrentChatDisplay: (message: string) => {
        set({currentChatDisplay: message})
    },
    setLoadingMessage: (message: string | null) => {
        set({loadingMessage: message})
    },
    setThreadId: (id: string) => {
        set({threadId: id})
    },
    incrementMessageCount: () => {
        set({messageCount: get().messageCount + 1})
    },
    setCurrentState: (state: string) => {
        set({currentState: state})
    },

    setPrerequisiteQuestions: (questions: Question[]) => {
        set({prerequisteQuestions: questions})
    },

    setCourseTitle: (title: string) => set({courseTitle: title}),
    addAnswer(index, answer) {
        let currentMap = get().prerequisitesAnswers;
        currentMap.set(index, answer);
        set({prerequisitesAnswers: currentMap})
    },
    setCourseTargets(targets: CourseTarget) {
        set({courseTargets: {targets: targets.targets, recommended: targets.recommended}})
    },
    setSelectedTarget(index: number) {
        set({selectedTarget: index})
    },
    setCourseOutline: (outline: CourseOutline) => {
        set({courseOutline: outline})
    },
    setRewindToStep: (step: number | null) => {
        set({rewindToStep: step})
    },
    reset: () => set({ ...store.getInitialState() })
}))

export default useCreationStore;