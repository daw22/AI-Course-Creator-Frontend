"use client";

import { useState, useRef, useEffect } from "react";
import ProgressIndicator from "@/components/progressIndicator";
import QuizContainer from "@/components/quiz";
import Chat from "@/components/chat";

const quizQuestions = [
  {
    question: "What is the main topic you want to learn about?",
    choices: ["Math", "Science", "History", "Art"],
  },
  {
    question: "What is your current proficiency level?",
    choices: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    question: "How much time can you dedicate weekly?",
    choices: ["1-2 hours", "3-5 hours", "6+ hours"],
  },
];

export default function CreateCourse() {
  const [progress, setProgress] = useState("title");
  
  return (
    <div className="flex flex-col items-center justify-start h-[calc(100vh - 16)] text-white px-4 pt-20 gap-12">
      <ProgressIndicator currentStep={0} />
      {progress === "title" && <Chat />}
      {progress === "prerequisites" && (
        <QuizContainer
          questions={quizQuestions}   
        />
      )}
    </div>
  )
}
