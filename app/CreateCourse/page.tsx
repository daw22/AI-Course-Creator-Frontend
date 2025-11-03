"use client";

import ProgressIndicator from "@/components/progressIndicator";
import QuizContainer from "@/components/quiz";
import Chat from "@/components/chat";
import CourseTarget from "@/components/courseTarget";
import CourseOutline from "@/components/courseOutline";
import useCreationStore from "@/state/creationState";
import useProtection from "@/components/useProtection";

export default function CreateCourse() {
  useProtection();
  const currentState = useCreationStore((state) => state.currentState)
  const steps = ["title", "prerequisites", "target", "outline"]; 
  return (
    <div className="flex flex-col items-center justify-start h-[calc(100vh - 16)] text-white px-4 pt-20 gap-12">
      <ProgressIndicator currentStep={steps.indexOf(currentState)} />
      {currentState === "title" && <Chat />}
      {currentState === "prerequisites" && (
        <QuizContainer />
      )}
      {currentState === "target" && (
        <CourseTarget />
      )}
      {currentState === "outline" && (
        <CourseOutline />
      )}
    </div>
  )
}
