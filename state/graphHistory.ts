import { create } from "zustand";
import { fetchEventSource } from "@microsoft/fetch-event-source"
import useUserStore from "./user";
import useCreationStore from "./creationState";
import { Question } from "./creationState";
import { format } from "path";

const GRAPH_START_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/start`
const GRAPH_RESUME_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/resume`

const { getAccessToken, setAccessToken } = useUserStore.getState();

const setDisplayMessage = useCreationStore.getState().setCurrentChatDisplay;
const setCurrentState = useCreationStore.getState().setCurrentState;
const setCourseTitle = useCreationStore.getState().setCourseTitle;
const setPrerequisiteQuestions = useCreationStore.getState().setPrerequisiteQuestions;

const abortController = new AbortController();

type Checkpoint = {
    type: "CREATION" | "GENERATION";
    nodeName: string;
    checkpointId: string;
    stateSnapshot: string; // Serialized state snapshot -> the output of resuming from this checkpoint
}

type CourseHistory = {
    courseTitle: string | null;
    threadId: string;
    checkpoints: Checkpoint[];
}

type GraphHistoryState = {
    history: CourseHistory[];
    createCourseHistory: (courseTitle: string, threadId: string) => void;
    addCheckpoint: (threadId: string, checkpoint: Checkpoint) => void;
    getCourseHistory: (threadId: string) => CourseHistory | null;
    deleteCourseHistory: (threadId: string) => void;
    rewindtoCheckpoint: (threadId: string, checkpointId: string) => void;
    startGraph: (input: string) => void;
    resumeGraph: (response: string | string[], threadId: string, resumeFrom: string) => void;
    error: string | null;
};

const useGraphHistoryStore = create<GraphHistoryState>((set, get) => ({
    history: [],
    error: null,
    createCourseHistory: (courseTitle: string, threadId: string) => {
        set((state) => ({
            history: [...state.history, { courseTitle, threadId, checkpoints: [] }],
        }));
    },
    addCheckpoint: (threadId: string, checkpoint: Checkpoint) => {
        set((state) => ({
            history: state.history.map((courseHistory) =>
                courseHistory.threadId === threadId
                    ? {
                          ...courseHistory,
                          checkpoints: [...courseHistory.checkpoints, checkpoint],
                      }
                    : courseHistory
            ),
        }));
    },
    getCourseHistory: (threadId: string) => {
        const courseHistory = get().history.find(
            (ch) => ch.threadId === threadId
        );
        return courseHistory || null;
    },
    deleteCourseHistory: (threadId: string) => {
        set((state) => ({
            history: state.history.filter(
                (courseHistory) => courseHistory.threadId !== threadId
            ),
        }));
    },
    rewindtoCheckpoint: (threadId: string, checkpointId: string) => {
        set((state) => ({
            history: state.history.map((courseHistory) => {
                if (courseHistory.threadId === threadId) {
                    const checkpointIndex = courseHistory.checkpoints.findIndex(
                        (cp) => cp.checkpointId === checkpointId
                    );
                    if (checkpointIndex !== -1) {
                        return {
                            ...courseHistory,
                            checkpoints: courseHistory.checkpoints.slice(
                                0,
                                checkpointIndex + 1
                            ),
                        };
                    }
                }
                return courseHistory;
            }),
        }));
        // resume
    },
    startGraph: async (input: string) => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            set({ error: "No access token available" });
            return;
        }
        fetchEventSource(GRAPH_START_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ "answer": input }),
            signal: abortController.signal,
            onmessage: (event) => {
                console.log("Graph Start Event:", event);
                // expect 3 types of events here 1- on_course_title_question 2-on_course_title_decided 3-on_prereqiesite_questions
                let data = null
                try{
                    data = JSON.parse(event.data)
                }catch(e){
                    throw e
                }
                if (event.event == "on_course_title_question"){
                    let question = data?.question || null;
                    if (question) setDisplayMessage(question)
                }
                if (event.event == "on_course_title_decided") {
                    const courseTitle = data?.course_title || null;
                    if (courseTitle) setCourseTitle(courseTitle)
                    // create course history
                    get().createCourseHistory(courseTitle, data?.config.configurable.thread_id);
                    const checkpoint: Checkpoint = {type: "CREATION", nodeName: "Course Title Decided", checkpointId: data?.config?.configurable.checkpoint_id, stateSnapshot: data?.course_title}
                    get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
                }
                if (event.event == "on_prerequisite_questions"){
                    const questions = data?.questions || null;
                    let formatedquestions: Question[] = []
                    if (questions) {
                        questions.forEach((question: string) => {
                            let newQuestion: Question = {
                                question: question,
                                choices: ["I am Good", "I need a refresher", " A targeted Introduction", "Foundational lesson"]
                            }
                            formatedquestions.push(newQuestion)
                        })
                        setPrerequisiteQuestions(formatedquestions);
                        setCurrentState("prerequisites")
                        // add checheckpoint
                        const checkpoint: Checkpoint = {type: "CREATION", nodeName: "Prerequisite Questions", checkpointId: data?.config?.configurable.checkpoint_id, stateSnapshot: JSON.stringify(questions)}
                        get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
                    }
                }
            },
            onerror: (err) => {
                if (err instanceof Response) {
                    // try to parse json
                    let errorData = null;
                    try{
                        errorData = JSON.parse(err.body ? err.body.toString() : "{}");
                    }catch(e){
                        console.error("Failed to parse error response:", e);
                    }
                    if (err.status === 401 && errorData?.detail === "Invalid authentication credentials") {
                        const refreshed = refreshToken();
                        if (refreshed){
                            abortController.abort();
                            get().startGraph(input);
                        }
                        return;
                    }else {
                        throw err;
                    }
                }
                if (err?.message?.includes("Expected content-type")) {
                    console.warn("Got non-SSE response (likely JSON). Checking for expired token...");
                    // retry here too
                    const refreshed = refreshToken();
                    if (refreshed){
                        abortController.abort();
                        get().startGraph(input);
                    }
                    return;
                }
                console.log("error:", err)
                throw err
            }   
        });
    },
    resumeGraph: (response: string | string[], threadId: string, resumeFrom: string) => {
        fetchEventSource(GRAPH_RESUME_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ response, threadId, resumeFrom }),
            onmessage: (event) => {
                console.log("Graph Resume Event:", event.data);
            },
        });
    },
}));

export const refreshToken = () => {
    let success = false
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Important to include cookies
    })
    .then(response => response.json())
    .then(data => {
        const newAccessToken = data.access_token;
        setAccessToken(newAccessToken);
        success = true
    })
    .catch(error => {
        success = false
    });
    return success;
}

export default useGraphHistoryStore;