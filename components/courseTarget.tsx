"use client";
import React, { useState } from "react";
import useCreationStore from "@/state/creationState";
import useGraphHistoryStore from "@/state/graphHistory";
import LoadingMessage from "./loadingMessage";

export default function CourseTarget() {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const targets = useCreationStore((state) => state.courseTargets);

  const threadId = useCreationStore((state) => state.threadId);
  const setLoadingMessage = useCreationStore((state) => state.setLoadingMessage);
  const loadingMessage = useCreationStore((state) => state.loadingMessage);
  const setSelectedTarget = useCreationStore((state) => state.setSelectedTarget);

  const resumeGraph = useGraphHistoryStore((state) => state.resumeGraph);


  const handleChoiceSelect = (index: number) => {
    setSelectedChoice(index);
  };

  const handleSubmit = () => {
    setLoadingMessage("Submitting your course target...");
    if (selectedChoice !== null) {
      setSelectedTarget(selectedChoice);
      resumeGraph(
        selectedChoice,
        threadId ?? "",
        "get_course_target"
      );
    }
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center px-4 py-8 min-w-128">
      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Question Text */}
        <div
          className="mb-12"
        >
          <h1
            className="text-lg sm:text-sm md:text-md lg:text-lg font-light text-white text-center leading-relaxed"
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
              maxWidth: "100%",
            }}
          >
            Pick a target for this course, This will help us tailor the course content to your needs.
          </h1>
          {loadingMessage && <LoadingMessage message={loadingMessage} />}
        </div>
        
        {/* Choices Grid */}
        <div
          className="flex flex-col gap-4 mb-12"
        >
          {targets?.targets.map((target, index) => (
            <button
              key={index}
              onClick={() => handleChoiceSelect(index)}
              className={`p-1 border-1 text-left transition-all duration-200 ease-out active:scale-95 ${
                selectedChoice === index
                  ? "border-white bg-blue-900 bg-opacity-5"
                  : "border-gray-600 hover:border-white"}`
                }
            >
              <div className="flex items-start gap-3 m-2">
                <span
                  className="text-white font-light text-base"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {target}
                </span>
              </div>
            </button>
          ))}
        </div>
        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedChoice === null || loadingMessage !== null}
            className="px-8 py-3 border border-white text-white font-light text-sm tracking-widest uppercase hover:bg-blue-900 hover:text-white transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: #000000;
        }

        @keyframes slideInDefault {
          from {
            opacity: 0;
            transform: translateX(0);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100px);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}



