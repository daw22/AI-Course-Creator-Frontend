import { create } from "zustand";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import useUserStore from "./user";
import useCreationStore from "./creationState";
import useCurrentCourseStore from "./curentCourse";
import { Question } from "./creationState";

const GRAPH_START_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/start`;
const GRAPH_RESUME_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/resume`;
const GRAPH_RESUME_CHECKPOINT_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graph/rerunfromcheckpoint`;

const { getAccessToken, setAccessToken } = useUserStore.getState();

const setDisplayMessage = useCreationStore.getState().setCurrentChatDisplay;
const setCurrentState = useCreationStore.getState().setCurrentState;
const setCourseTitle = useCreationStore.getState().setCourseTitle;
const setPrerequisiteQuestions = useCreationStore.getState().setPrerequisiteQuestions;
const setThreadId = useCreationStore.getState().setThreadId;
const setLoadingMessage = useCreationStore.getState().setLoadingMessage;
const setCourseTargets = useCreationStore.getState().setCourseTargets;
const setCourseOutline = useCreationStore.getState().setCourseOutline;
const setRewindedToCheckpoint = useCreationStore.getState().setRewindedToCheckpoint;
const setCurrentContent = useCurrentCourseStore.getState().setCurrentContent;
const setQuiz = useCurrentCourseStore.getState().setQuiz;
const setCourseProgress = useCurrentCourseStore.getState().setCourseProgress;
const setWaitingForStream = useCurrentCourseStore.getState().setWaitingForStream;

type Checkpoint = {
  type: "CREATION" | "GENERATION";
  nodeName: string;
  checkpointId: string;
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
  removeCheckpoint: (threadId: string, checkpointId: string) => void;
  getCourseHistory: (threadId: string) => CourseHistory | null;
  deleteCourseHistory: (threadId: string) => void;
  rewindtoCheckpoint: (threadId: string, step: number) => void;
  startGraph: (input: string) => Promise<void>;
  resumeGraph: (response: string | string[] | number | number[], threadId: string, resumeFrom: string) => Promise<void>;
  resumeGraphFromCheckpoint: (response: string | string[] | number | number[] |null, threadId: string, checkpointId: string) => Promise<void>;
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
  removeCheckpoint: (threadId, checkpointId) =>
    set((state) => ({
      history: state.history.map((courseHistory) => {
        if (courseHistory.threadId === threadId) {
          return {
            ...courseHistory,
            checkpoints: courseHistory.checkpoints.filter(
              (cp) => cp.checkpointId !== checkpointId
            ),
          };
        }
        return courseHistory;
      }),
    })),  

  getCourseHistory: (threadId) => get().history.find((ch) => ch.threadId === threadId) || null,

  deleteCourseHistory: (threadId) =>
    set((state) => ({
      history: state.history.filter((courseHistory) => courseHistory.threadId !== threadId),
    })),

  rewindtoCheckpoint: (threadId, step) => {
    set((state) => ({
      history: state.history.map((courseHistory) => {
        if (courseHistory.threadId === threadId) {
          console.log("before rewind Course History:", courseHistory);
            return {
              ...courseHistory,
              checkpoints: courseHistory.checkpoints.slice(0, step),
            };
        }
        return courseHistory;
      }),
    }));
    console.log("after rewind Course History:", get().history);
    if (step > 0)
    setRewindedToCheckpoint(get().getCourseHistory(threadId)?.checkpoints[step - 1]?.checkpointId || "");
    console.log("Rewinded to checkpoint:", get().getCourseHistory(threadId)?.checkpoints[step - 1]?.checkpointId);
  },

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
          // handle interrupts
          if (event.event === "on_chain_interrupt") {
            const name = data?.interrupt;
            if (name) handleInterrupts(name, data?.config?.configurable, get);
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
          // interrupts
          if (event.event === "on_chain_interrupt") {
            const name = data?.interrupt;
            if (name) handleInterrupts(name, data?.config?.configurable, get);
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
            }
          }

          if (event.event === "on_course_target_suggestion") {
            const targets = data?.course_target_suggestion;
            if (targets) {
              setCourseTargets(targets);
              setLoadingMessage(null);
              setCurrentState("target");
            }
          }

          if (event.event === "on_course_target_picked") {
            setLoadingMessage("creating course outline");
          }

          if (event.event === "on_course_outline_generated") {
            const outline = data?.course_outline;
            if (!outline) return;
            setLoadingMessage(null);
            setCourseOutline(outline.chapters);
            setCurrentState("outline");
            // check if "course_outline_generated" checkpoint already exists delete it to avoid duplicates
            const courseHistory = get().getCourseHistory(data?.config.configurable.thread_id);
            const existing = courseHistory?.checkpoints.find(
              (cp) => cp.nodeName === "Course Outline Generated"
            );
            if (existing) {
              get().removeCheckpoint(data?.config.configurable.thread_id, existing.checkpointId);
            }          
          }

          if (event.event === "on_content_creation_start") {
            const progress = data?.course_progress;
            if (progress) {
              setCourseProgress(progress);
            }
          }
          
          if (event.event === "on_markdown_stream") {
            const contentChunk = data?.markdown;
            if (contentChunk) {
              setCurrentContent(contentChunk);
            }
            setWaitingForStream(false);
          }

          if (event.event === "on_quiz_created") {
            const quizData = data?.quiz;
            console.log("Quiz Data Received:", quizData);
            if (quizData) {
              const formattedQuiz = quizData.map((q: any) => ({
                question: q.question,
                options: q.options,
                answer: q.answer,
              }));
              setQuiz(formattedQuiz);
              setLoadingMessage(null);
            }
          }

          if (event.event === "on_quiz_result_stored") {
            setQuiz(null);
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
  resumeGraphFromCheckpoint: async (response, threadId, checkpointId) => {
    const accessToken = getAccessToken();
    const controller = new AbortController();
    set({ abortController: controller });

    try {
      await fetchEventSource(GRAPH_RESUME_CHECKPOINT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ response, thread_id: threadId, resume_from: checkpointId }),
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
                get().resumeGraphFromCheckpoint(response, threadId, checkpointId);
              }, 200);
            } else {
              set({ error: "Unauthorized. Please log in again." });
            }
          }
        },
        onmessage: (event) => {
          let data: any = null;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            console.error("Bad JSON event:", e);
            return;
          }
          // interrupts
          if (event.event === "on_chain_interrupt") {
            const name = data?.interrupt;
            if (name) handleInterrupts(name, data?.config?.configurable, get);
          }
          if (event.event === "on_course_target_suggestion") {
            const targets = data?.course_target_suggestion;
            if (targets) {
              setCourseTargets(targets);
              setLoadingMessage(null);
              setCurrentState("target");
            }
          }

          if (event.event === "on_course_target_picked") {
            setLoadingMessage("creating course outline");
          }

          if (event.event === "on_course_outline_generated") {
            const outline = data?.course_outline;
            if (!outline) return;
            setLoadingMessage(null);
            setCourseOutline(outline.chapters);
            setCurrentState("outline");
            // check if "course_outline_generated" checkpoint already exists delete it to avoid duplicates
            const courseHistory = get().getCourseHistory(data?.config.configurable.thread_id);
            const existing = courseHistory?.checkpoints.find(
              (cp) => cp.nodeName === "Course Outline Generated"
            );
            if (existing) {
              get().removeCheckpoint(data?.config.configurable.thread_id, existing.checkpointId);
            }
          }

          if (event.event === "on_content_creation_start") {}
          if (event.event === "on_content_chunk") {
            const contentChunk = data?.content_chunk;
            if (contentChunk) {
              setCurrentContent(contentChunk);
            }
          }
        }
      });
    } catch (err) {
      console.error("Stream resume from checkpoint failed:", err);
    }
  }
}));

const handleInterrupts = (name: string, config: {thread_id: string, checkpoint_id: string}, get: () => GraphHistoryState) => {
  let checkpoint: Checkpoint;
  switch (name) {
    case "get_answer":
      checkpoint = {
        type: "CREATION",
        nodeName: "Get Answer Interrupt",
        checkpointId: config.checkpoint_id,
      };
      break;
    case "get_course_target":
      checkpoint = {
        type: "CREATION",
        nodeName: "Get Course Target Interrupt",
        checkpointId: config.checkpoint_id,
      };
      break;
    case "outline_approval":
      checkpoint = {
        type: "CREATION",
        nodeName: "Outline Approval Interrupt",
        checkpointId: config.checkpoint_id,
      };
      break;
     case "content_creator_start":
      checkpoint = {
        type: "GENERATION",
        nodeName: "Content Creator Start Interrupt",
        checkpointId: config.checkpoint_id,
      };
      break;
     case "quiz_time":
      checkpoint = {
        type: "GENERATION",
        nodeName: "Quiz Time Interrupt",
        checkpointId: config.checkpoint_id,
      };
      break; 
    default:
      checkpoint = {
        type: "GENERATION",
        nodeName: "Unknown Interrupt",
        checkpointId: config.checkpoint_id,
      };
      break;
  }
  get().addCheckpoint(config.thread_id, checkpoint);
  console.log("checkpoint added for interrupt:", get().history);
}

export default useGraphHistoryStore;
