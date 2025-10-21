"use client";
import React, { use, useState } from "react";
import useUserStore from "@/state/user";
import useGraphHistoryStore from "@/state/graphHistory";
import useCreationStore from "@/state/creationState";

export default function Chat() {
  const [input, setInput] = useState("");
  const user = useUserStore((state) => state.user);

  const startGraph = useGraphHistoryStore((state) => state.startGraph);
  const resumeGraph = useGraphHistoryStore((state) => state.resumeGraph);

  const displayMessage = useCreationStore((state) => state.currentChatDisplay)
  const messageCount = useCreationStore((state) => state.messageCount);
  const incrementMessageCount = useCreationStore((state) => state.incrementMessageCount);
  const threadId = useCreationStore((state) => state.threadId);

  const [displayedQuestion, setDisplayedQuestion] = useState(
    `Hey ${user?.firstName}, What do you want to learn about today?`,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // get the last event
    if (messageCount === 0) {
      startGraph(input.trim());
      incrementMessageCount();
    } else {
      //resume the graph
      if (threadId) {
        resumeGraph(input.trim(), threadId, 'course_title_response');
        incrementMessageCount();
      }
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className=" bg-black flex flex-col items-center justify-center px-4 py-8 min-w-2/3">
      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Question Text */}
        <div className="mb-12">
          <h1
            className={`text-2xl sm:text-lg md:text-xl lg:text-2xl font-light text-white text-center leading-tight transition-all duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
              maxWidth: "100%",
            }}
          >
            {displayMessage}
          </h1>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative mb-8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              className="w-full bg-transparent border-b-2 border-white text-white placeholder-gray-400 text-lg md:text-xl py-4 focus:outline-none focus:border-gray-300 transition-colors duration-200"
              autoFocus
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 border border-white text-white font-light text-sm tracking-widest uppercase hover:bg-blue-900 hover:text-white transition-all duration-300 ease-out active:scale-95"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Hint Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Press Enter or click Submit to continue
          </p>
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

        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}



