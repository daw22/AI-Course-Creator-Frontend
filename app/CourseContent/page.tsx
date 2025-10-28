"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import useCurrentCourseStore from "@/state/curentCourse";
import { Response } from "@/components/ai-elements/response";
import useGraphHistoryStore from "@/state/graphHistory";
import useCreationStore from "@/state/creationState";


export default function CourseViewerPage() {
  const [ready, setReady] = useState(false);
  const [indexOpen, setIndexOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const courseInfo = useCurrentCourseStore((state) => state.course);
  const loadGeneratedContent = useCurrentCourseStore((state) => state.loadGeneratedContent);
  const currentContent = useCurrentCourseStore((state) => state.currentContent);

  const [progress] = useState<[number, number]>(courseInfo ? courseInfo.progress : [0, 0]);
  const [currentSubtopic, setCurrentSubtopic] = useState<number>(progress[1] - 1);
  const [currentChapter, setCurrentChapter] = useState(progress[0]);

  const resumeGraph = useGraphHistoryStore((state) => state.resumeGraph);
  const threadId = useCreationStore((state) => state.threadId);

  console.log("Course Info:", courseInfo?.outline);

  const current =
    courseInfo?.outline[currentChapter] !== undefined
      ? courseInfo.outline[currentChapter].subtopics[currentSubtopic] ?? null
      : null;

  const nextSubtopic = () => {
    const nextIndex = currentSubtopic + 1;

    const currentChapterSubtopics = courseInfo?.outline[currentChapter]?.subtopics ?? [];
    const outlineLength = courseInfo?.outline?.length ?? 0;

    if (nextIndex < currentChapterSubtopics.length) {
      setCurrentSubtopic(nextIndex);
      // start generating subtopic content here
      resumeGraph("", threadId ?? "", "content_creator_start")
    } else if (currentChapter + 1 < outlineLength) {
      setCurrentChapter(currentChapter + 1);
      setCurrentSubtopic(-1);
    }
  };

  const bg = darkMode ? "bg-neutral-950 text-gray-100" : "bg-gray-100 text-gray-900";
  const panel = darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-300";
  // load the already generated content
  useEffect(() => {
    const load = async () => {loadGeneratedContent();}
    load();
    setReady(true);
  }, []);
  
  {!ready && <div>
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      <p className="mt-4 text-gray-400">Loading course content...</p>
    </div>
  </div>
  }

  {!courseInfo && <div>Something went wrong</div>}
  
  return (
    <div className={`flex h-screen ${bg} transition-colors duration-300`}>
      {/* Sidebar / Index */}
      <div
        className={`${
          indexOpen ? "w-64" : "w-0"
        } transition-all duration-300 ${panel} overflow-hidden border-r`}
      >
        <div className="flex justify-between items-center p-3 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">{courseInfo?.title}</h2>
          <button
            className="p-1 hover:bg-neutral-800 rounded-md"
            onClick={() => setIndexOpen(false)}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-50px)]">
          {courseInfo?.outline.map((chapter, cIdx) => (
            <div key={cIdx}>
              <div
                className={`font-semibold mb-1 cursor-pointer ${
                  cIdx > progress[0] ? "opacity-30 blur-[1px]" : "hover:text-blue-400"
                } ${
                  currentChapter === cIdx && currentSubtopic === null
                    ? "text-blue-400"
                    : ""
                }`}
                onClick={() => {
                  if (cIdx <= progress[0]) {
                    setCurrentChapter(cIdx);
                    setCurrentSubtopic(-1);
                  }
                }}
              >
                {chapter.chapter_number}. {chapter.chapter_title}
              </div>

              <ul className="ml-4 space-y-1">
                {chapter.subtopics.map((sub, sIdx) => {
                  const locked =
                    cIdx > progress[0] ||
                    (cIdx === progress[0] && sIdx >= progress[1]);
                  return (
                    <li
                      key={sIdx}
                      className={`text-sm flex items-center gap-2 cursor-pointer ${
                        locked
                          ? "opacity-30 blur-[1px]"
                          : "hover:text-blue-400 transition-colors"
                      } ${
                        currentChapter === cIdx && currentSubtopic === sIdx
                          ? "text-blue-400"
                          : ""
                      }`}
                      onClick={() => {
                        if (!locked) {
                          setCurrentChapter(cIdx);
                          setCurrentSubtopic(sIdx);
                        }
                      }}
                    >
                      {cIdx + 1}.{sIdx + 1} {sub.subtopic_title}
                      {/* {sub.generating && (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                      )} */}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Fixed Toolbar */}
        <div
          className={`fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-3 border-b ${panel} z-50`}
        >
          <div className="flex items-center gap-2">
            {!indexOpen && (
              <button
                className="p-1 hover:bg-neutral-800 rounded-md"
                onClick={() => setIndexOpen(true)}
              >
                <ChevronRight size={18} />
              </button>
            )}
            <h1 className="text-base font-medium">
              {currentSubtopic === null
                ? `${courseInfo?.outline?.[currentChapter].chapter_number}. ${courseInfo?.outline?.[currentChapter].chapter_title}`
                : `${courseInfo?.outline?.[currentChapter].chapter_number}.${currentSubtopic + 1} — ${current?.subtopic_title}`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={nextSubtopic}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white px-3 py-1.5 rounded-md text-sm"
            >
              <Play size={16} /> Generate Next
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md hover:bg-neutral-800 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto mt-[56px] flex justify-center items-start p-6">
          <div
            className={`${
              darkMode ? "bg-neutral-900 text-gray-100" : "bg-white text-gray-900"
            } rounded-lg shadow-lg w-full max-w-3xl min-h-[80vh] p-6`}
          >
            {/* Replace this with your StreamDown markdown renderer */}
            {currentSubtopic === -1 ? (
              <div className="flex flex-col items-center justify-center h-full mt-24 prose max-w-none">
                <h2 className = "text-3xl font-bold mb-4">
                  Chapter {currentChapter + 1}
                </h2>
                <h2 className="text-2xl font-semibold">
                  {courseInfo?.outline?.[currentChapter].chapter_title}
                </h2>
                <p className= "mt-6 text-center text-md">
                  {courseInfo?.outline?.[currentChapter].chapter_target || ""}
                </p>
              </div>
            ) : (
              <Response>{currentContent}</Response>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
