import { create } from "zustand";
import { fetchEventSource } from "@microsoft/fetch-event-source"
import useUserStore from "./user";

const GRAPH_START_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/start`
const GRAPH_RESUME_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/resume`

const { getAccessToken, setAccessToken } = useUserStore.getState();

const token = getAccessToken();
type Checkpoint = {
    type: "CREATION" | "GENERATION";
    nodeName: string;
    checkpointId: string;
    stateSnapshot: string; // Serialized state snapshot -> the output of resuming from this checkpoint
}

type CourseHistory = {
    courseId: string;
    threadId: string;
    checkpoints: Checkpoint[];
}

type GraphHistoryState = {
    history: CourseHistory[];
    createCourseHistory: (courseId: string, threadId: string) => void;
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
    createCourseHistory: (courseId: string, threadId: string) => {
        set((state) => ({
            history: [...state.history, { courseId, threadId, checkpoints: [] }],
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
    startGraph: (input: string) => {
        fetchEventSource(GRAPH_START_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ "answer": input }),
            onmessage: (event) => {
                console.log("Graph Start Event:", event.data);
            },
            onerror: (err) => {
                //handdle refresh token if 401
                if (err.status === 401) {
                    const refreshed = refreshToken();
                    if (refreshed) {
                        console.log("Token refreshed, retrying request...");
                        get().startGraph(input);
                        return; // Retry the request
                    } else {
                        set({ error: "Session expired. Please log in again." });
                        return;
                    }
                }
                console.error("Graph Start Error:", err);
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