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
    courseOutline: string | null;

    //actoins
    setCurrentChatDisplay: (message: string) => void;
    setLoadingMessage: (message: string | null) => void;
    setCurrentState: (state: string) => void;
    setThreadId: (id: string) => void;
    setPrerequisiteQuestions: (questions: Question[]) => void;
    setCourseTitle: (title: string) => void;
    addAnswer: (index: number, answer: string) => void;
    setSelectedTarget: (index: number) => void;
    incrementMessageCount: () => void;
}

const useCreationStore = create<CreationState>((set, get) => ({
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
    setSelectedTarget(index: number) {
        set({selectedTarget: index})
    }
}))

export default useCreationStore;