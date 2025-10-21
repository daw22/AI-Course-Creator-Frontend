import { create } from "zustand";
import useUserStore from "./user";
import { MonitorPause } from "lucide-react";

export interface Question {
    question: string;
    choices: string[];
}

type CourseTarget = {
    targets: string[];
    recomended: number
}

type CreationState = {
    currentState: string;
    currentChatDisplay: string | null;
    prerequisteQuestions: Question[];
    prerequisitesAnswers: Map<number, string>
    courseTargets: CourseTarget | null;
    selectedTarget: number | null;
    courseTitle: string | null;
    courseOutline: string | null;

    //actoins
    setCurrentChatDisplay: (message: string) => void;
    setCurrentState: (state: string) => void;
    setPrerequisiteQuestions: (questions: Question[]) => void;
    setCourseTitle: (title: string) => void;
    addAnswer: (index: number, answer: string) => void;
    setSelectedTarget: (index: number) => void;
}

const useCreationStore = create<CreationState>((set, get) => ({
    currentState: "title",
    currentChatDisplay: `Hey ${useUserStore.getState().user?.firstName || ''}, What would you like to learn about today?`,
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