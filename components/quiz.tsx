"use client";
import React, { useState } from "react";
import useCreationStore from "@/state/creationState";
import useGraphHistoryStore from "@/state/graphHistory";
import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";

export default function QuizContainer() {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const questions = useCreationStore((state) => state.prerequisteQuestions);
  const addAnswer = useCreationStore((state) => state.addAnswer);
  const prerequisitesAnswers = useCreationStore((state) => state.prerequisitesAnswers);
  const threadId = useCreationStore((state) => state.threadId);
  const setLoadingMessage = useCreationStore((state) => state.setLoadingMessage);

  const resumeGraph = useGraphHistoryStore((state) => state.resumeGraph);

  const question = questions[currentQuestion];

  const handleChoiceSelect = (index: number) => {
    setSelectedChoice(index);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1 && selectedChoice !== null) {
      setDirection("right");
      setTimeout(() => {
        addAnswer(currentQuestion, questions[currentQuestion].choices[selectedChoice]);
        setCurrentQuestion(currentQuestion + 1);
        setSelectedChoice(null);
        setDirection(null);
      }, 300);
    }

    if (currentQuestion == questions.length -1 ) {
      // finish condition -> send answers
      if (selectedChoice === null) return;
      addAnswer(currentQuestion, questions[currentQuestion].choices[selectedChoice]);
      setTimeout(() => {
        const answersArray = prerequisitesAnswers.values();
        //console.log("Submitting answers: ", Array.from(answersArray), "threadId: ", threadId);
        resumeGraph(Array.from(answersArray), threadId ?? '', 'get_answer');
      }, 300);
      setLoadingMessage("Submitting your answers...");
      setTimeout(() => {
        setLoadingMessage("Assessing course targets");
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection("left");
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setSelectedChoice(null);
        setDirection(null);
      }, 300);
    }
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center px-4 py-8 min-w-128">
      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Question Text */}
        <div
          className="mb-12"
          style={{
            animation:
              direction === "right"
                ? "slideOutLeft 0.3s ease-out forwards"
                : direction === "left"
                  ? "slideOutRight 0.3s ease-out forwards"
                  : "slideInDefault 0.3s ease-out forwards",
          }}
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
            {question.question}
          </h1>
        </div>

        {/* Choices Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
          style={{
            animation:
              direction === "right"
                ? "slideOutLeft 0.3s ease-out forwards"
                : direction === "left"
                  ? "slideOutRight 0.3s ease-out forwards"
                  : "slideInDefault 0.3s ease-out forwards",
          }}
        >
          {question.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoiceSelect(index)}
              className={`p-2 border-2 text-left transition-all duration-200 ease-out active:scale-95 ${
                selectedChoice === index
                  ? "border-white bg-blue-900 bg-opacity-5"
                  : "border-gray-600 hover:border-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-white font-light text-lg w-6 flex-shrink-0">
                  {index == 0 && 'A'}
                  {index == 1 && 'C'}
                  {index == 2 && 'B'}
                  {index == 3 && 'D'}
                </span>
                <span
                  className="text-white font-light text-base"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {choice}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-white text-white font-light text-xs sm:text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-gray-400 text-sm">
            {currentQuestion + 1} / {questions.length}
          </span>

          <button
            onClick={handleNext}
            className="px-6 py-3 border border-white text-white font-light text-xs sm:text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
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



