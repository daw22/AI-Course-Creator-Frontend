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

export default function CourseViewerPage() {
  const [ready, setReady] = useState(false);
  const [indexOpen, setIndexOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const courseInfo = useCurrentCourseStore((state) => state.course);
  const loadGeneratedContent = useCurrentCourseStore((state) => state.loadGeneratedContent);
  const waitingStream = useCurrentCourseStore((state) => state.waitingForStream);
  const setWaitingStream = useCurrentCourseStore((state) => state.setWaitingForStream);

  const currentContent = useCurrentCourseStore((state) => state.currentContent);
  const swapCurrentContent = useCurrentCourseStore((state) => state.swapCurrentContent);
  // const quiz = useCurrentCourseStore((state) => state.quiz);
  const setCurrentContent = useCurrentCourseStore((state) => state.setCurrentContent);
  const progress = useCurrentCourseStore((state) => state.course?.progress) || [0, 0];
  
  const [currentChapter, setCurrentChapter] = useState(progress[0]);
  const [currentSubtopic, setCurrentSubtopic] = useState(progress[1] - 1);

  const resumeGraph = useGraphHistoryStore((state) => state.resumeGraph);

  const nextSubtopic = () => {
    // try to generate next topic if no quiz is due
    try {
      setCurrentContent("<<<CLEAR>>>"); // clear current content
      setCurrentChapter(progress[0]);
      setCurrentSubtopic(progress[1]);
      setWaitingStream(true);
      resumeGraph("", courseInfo?.threadId || "", "content_creator_start");
    }catch (error) {
      setWaitingStream(false);
      console.error("Error generating next subtopic:", error);
    }
  }

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
                  cIdx > progress[0] || waitingStream ? "opacity-30 blur-[1px]" : "hover:text-blue-400"
                } ${
                  currentChapter === cIdx && currentSubtopic === null
                    ? "text-blue-400"
                    : ""
                }`}
                onClick={() => {
                  if (cIdx <= progress[0] && !waitingStream) {
                    setCurrentChapter(cIdx);
                    setCurrentSubtopic(-1);
                  }
                }}
              >
                {chapter.chapter_number}. {chapter.chapter_title}
              </div>

              <ul className="ml-4 space-y-1">
                {chapter.subtopics.map((sub, sIdx) => {
                  return (
                    <li
                      key={sIdx}
                      className={`text-sm flex items-center gap-2 cursor-pointer ${
                        cIdx > progress[0] || (cIdx === progress[0] && sIdx >= progress[1] || waitingStream)
                          ? "opacity-30 blur-[1px]"
                          : "hover:text-blue-400 transition-colors"
                      } ${
                        currentChapter === cIdx && currentSubtopic === sIdx
                          ? "text-blue-400"
                          : ""
                      }`}
                      onClick={() => {
                        if (!(cIdx > progress[0] || (cIdx === progress[0] && sIdx >= progress[1])) && !waitingStream) {
                          setCurrentChapter(cIdx);
                          setCurrentSubtopic(sIdx);
                          swapCurrentContent(cIdx, sIdx);
                        }
                      }}
                    >
                      {cIdx + 1}.{sIdx + 1} {sub.subtopic_title}
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
              {courseInfo?.outline[currentChapter]?.chapter_title || ""}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={waitingStream}
              onClick={nextSubtopic}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} /> Next
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
            ) : waitingStream ? (
              <div className="flex items-center gap-2 ">
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> 
                <span className="text-sm"> Generating content</span>
              </div>
            ) : (
              <Response isAnimating>{currentContent}</Response>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
