import { create } from "zustand";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import useUserStore from "./user";
import useCreationStore from "./creationState";
import { Question } from "./creationState";

const GRAPH_START_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/start`;
const GRAPH_RESUME_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/resume`;

const { getAccessToken, setAccessToken } = useUserStore.getState();

const setDisplayMessage = useCreationStore.getState().setCurrentChatDisplay;
const setCurrentState = useCreationStore.getState().setCurrentState;
const setCourseTitle = useCreationStore.getState().setCourseTitle;
const setPrerequisiteQuestions = useCreationStore.getState().setPrerequisiteQuestions;
const setThreadId = useCreationStore.getState().setThreadId;
const setLoadingMessage = useCreationStore.getState().setLoadingMessage;
const setCourseTargets = useCreationStore.getState().setCourseTargets;
const setCourseOutline = useCreationStore.getState().setCourseOutline;

type Checkpoint = {
  type: "CREATION" | "GENERATION";
  nodeName: string;
  checkpointId: string;
  stateSnapshot: string;
};

type CourseHistory = {
  courseTitle: string | null;
  threadId: string;
  checkpoints: Checkpoint[];
};

type GraphHistoryState = {
  history: CourseHistory[];
  createCourseHistory: (courseTitle: string, threadId: string) => void;
  addCheckpoint: (threadId: string, checkpoint: Checkpoint) => void;
  getCourseHistory: (threadId: string) => CourseHistory | null;
  deleteCourseHistory: (threadId: string) => void;
  rewindtoCheckpoint: (threadId: string, checkpointId: string) => void;
  startGraph: (input: string) => Promise<void>;
  resumeGraph: (response: string | string[] | number, threadId: string, resumeFrom: string) => Promise<void>;
  error: string | null;
  abortController?: AbortController;
};

export const refreshToken = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    const newAccessToken = data.access_token;
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      console.log("🔄 Token refreshed successfully.");
      return true;
    }
    return false;
  } catch (err) {
    console.error("❌ Token refresh failed:", err);
    return false;
  }
};

const useGraphHistoryStore = create<GraphHistoryState>((set, get) => ({
  history: [],
  error: null,

  createCourseHistory: (courseTitle, threadId) =>
    set((state) => ({
      history: [...state.history, { courseTitle, threadId, checkpoints: [] }],
    })),

  addCheckpoint: (threadId, checkpoint) =>
    set((state) => ({
      history: state.history.map((courseHistory) =>
        courseHistory.threadId === threadId
          ? { ...courseHistory, checkpoints: [...courseHistory.checkpoints, checkpoint] }
          : courseHistory
      ),
    })),

  getCourseHistory: (threadId) => get().history.find((ch) => ch.threadId === threadId) || null,

  deleteCourseHistory: (threadId) =>
    set((state) => ({
      history: state.history.filter((courseHistory) => courseHistory.threadId !== threadId),
    })),

  rewindtoCheckpoint: (threadId, checkpointId) =>
    set((state) => ({
      history: state.history.map((courseHistory) => {
        if (courseHistory.threadId === threadId) {
          const checkpointIndex = courseHistory.checkpoints.findIndex(
            (cp) => cp.checkpointId === checkpointId
          );
          if (checkpointIndex !== -1) {
            return {
              ...courseHistory,
              checkpoints: courseHistory.checkpoints.slice(0, checkpointIndex + 1),
            };
          }
        }
        return courseHistory;
      }),
    })),

  startGraph: async (input: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) return set({ error: "No access token available" });

    // ✅ Create a new abort controller for each run
    const controller = new AbortController();
    set({ abortController: controller });

    try {
      await fetchEventSource(GRAPH_START_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ answer: input }),
        signal: get().abortController?.signal,
        onopen: async (response) => {
          if (response.status === 401) {
            console.warn("Unauthorized response received. Attempting token refresh...");
            // abort the current stream
            controller.abort();
            const refreshed = await refreshToken();
            if (refreshed) {
              controller.abort();
              setTimeout(() => {
                console.log("🔁 Retrying startGraph after token refresh...");
                get().startGraph(input);
              }, 200);
            } else {
              set({ error: "Unauthorized. Please log in again." });
            }
          }
        },
        onmessage: (event) => {
          console.log("Graph Start Event:", event);

          let data: any = null;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            console.error("Bad JSON event:", e);
            return;
          }

          // handle events as before...
          if (event.event === "on_course_title_question") {
            const question = data?.question;
            if (question) setDisplayMessage(question);
            setThreadId(data?.config.configurable.thread_id);
            setLoadingMessage(null);
          }

          if (event.event === "on_course_title_decided") {
            const courseTitle = data?.course_title;
            if (courseTitle) setCourseTitle(courseTitle);
            get().createCourseHistory(courseTitle, data?.config.configurable.thread_id);
            const checkpoint: Checkpoint = {
              type: "CREATION",
              nodeName: "Course Title Decided",
              checkpointId: data?.config?.configurable.checkpoint_id,
              stateSnapshot: data?.course_title,
            };
            get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
            setLoadingMessage(`Course title decided: ${courseTitle}`);
            setThreadId(data?.config.configurable.thread_id);
            setTimeout(() => {
              setLoadingMessage("Generating prerequisites questions...");
            }, 1500);
          }

          if (event.event === "on_prerequisite_questions") {
            const questions = data?.questions;
            if (questions) {
              const formatted: Question[] = questions.map((q: string) => ({
                question: q,
                choices: ["I am Good", "I need a refresher", "A targeted Introduction", "Foundational lesson"],
              }));
              setPrerequisiteQuestions(formatted);
              setLoadingMessage(null);
              setCurrentState("prerequisites");
              const checkpoint: Checkpoint = {
                type: "CREATION",
                nodeName: "Prerequisite Questions",
                checkpointId: data?.config?.configurable.checkpoint_id,
                stateSnapshot: JSON.stringify(questions),
              };
              get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
            }
          }
        },
        onerror: (err) => {
          console.warn("⚠️ Stream error:", err);
          controller.abort();

          set({ error: err.message || "Unknown error" });
          throw err;
        },
      });
    } catch (err) {
      console.error("Stream failed:", err);
    }
  },

  resumeGraph: async (response, threadId, resumeFrom) => {
    const accessToken = getAccessToken();
    const controller = new AbortController();
    set({ abortController: controller });

    try {
      await fetchEventSource(GRAPH_RESUME_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ response, thread_id: threadId, resume_from: resumeFrom }),
        signal: get().abortController?.signal,
        onopen: async (res) => {
          if (res.status === 401) {
            console.warn("Unauthorized response received. Attempting token refresh...");
            // abort the current stream
            controller.abort();
            const refreshed = await refreshToken();
            if (refreshed) {
              controller.abort();
              setTimeout(() => {
                console.log("🔁 Retrying resumeGraph after token refresh...");
                get().resumeGraph(response, threadId, resumeFrom);
              }, 200);
            } else {
              set({ error: "Unauthorized. Please log in again." });
            }
          }
        },
        onmessage: (event) => {
          console.log("Graph Resume Event:", event);
          
          let data: any = null;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            console.error("Bad JSON event:", e);
            return;
          }

          // handle events as before...
          if (event.event === "on_course_title_question") {
            const question = data?.question;
            if (question) setDisplayMessage(question);
            setThreadId(data?.config.configurable.thread_id);
            setLoadingMessage(null);
          }

          if (event.event === "on_course_title_decided") {
            const courseTitle = data?.course_title;
            if (courseTitle) setCourseTitle(courseTitle);
            get().createCourseHistory(courseTitle, data?.config.configurable.thread_id);
            const checkpoint: Checkpoint = {
              type: "CREATION",
              nodeName: "Course Title Decided",
              checkpointId: data?.config?.configurable.checkpoint_id,
              stateSnapshot: data?.course_title,
            };
            get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
            setLoadingMessage(`Course title decided: ${courseTitle}`);

            setTimeout(() => {
              setLoadingMessage("Generating prerequisites questions...");
            }, 1500);
          }

          if (event.event === "on_prerequisite_questions") {
            const questions = data?.questions;
            if (questions) {
              const formatted: Question[] = questions.map((q: string) => ({
                question: q,
                choices: ["I am Good", "I need a refresher", "A targeted Introduction", "Foundational lesson"],
              }));
              setPrerequisiteQuestions(formatted);
              setLoadingMessage(null);
              setCurrentState("prerequisites");
              const checkpoint: Checkpoint = {
                type: "CREATION",
                nodeName: "Prerequisite Questions",
                checkpointId: data?.config?.configurable.checkpoint_id,
                stateSnapshot: JSON.stringify(questions),
              };
              get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
            }
          }

          if (event.event === "on_course_target_suggestion") {
            const targets = data?.course_target_suggestion;
            if (targets) {
              setCourseTargets(targets);
              setLoadingMessage(null);
              setCurrentState("target");
              const checkpoint: Checkpoint = {
                type: "CREATION",
                nodeName: "Course Target Suggestions",
                checkpointId: data?.config?.configurable.checkpoint_id,
                stateSnapshot: JSON.stringify(targets),
              };
              get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
            }
          }

          if (event.event === "on_course_target_picked") {
            setLoadingMessage("creating course outline");
          }

          if (event.event === "on_course_outline_generated") {
            const outline = data?.course_outline;
            if (!outline) return;
            setLoadingMessage(null);
            setCourseOutline(outline);
            setCurrentState("outline");
            const checkpoint: Checkpoint = {
              type: "CREATION",
              nodeName: "Course Outline Generated",
              checkpointId: data?.config?.configurable.checkpoint_id,
              stateSnapshot: JSON.stringify(data?.course_outline),
            };
            get().addCheckpoint(data?.config.configurable.thread_id, checkpoint);
          }
        },
        onerror: (err) => {
          console.warn("⚠️ Stream error (resume):", err);

          controller.abort();
          set({ error: err.message || "Unknown error" });
          throw err;
        },
      });
    } catch (err) {
      console.error("Stream resume failed:", err);
    }
  },
}));

export default useGraphHistoryStore;
