"use client";

import React, { useState } from "react";
import useGraphHistoryStore from "@/state/graphHistory";
import useCreationStore from "@/state/creationState";
import usePortalStore from "@/state/portal";
import LoadingMessage from "./loadingMessage";

export default function ImprovementForm() {
  const [note, setNote] = useState<string>("");
  const closePortal = usePortalStore((state) => state.closePortal);
  const resumeGraph = useGraphHistoryStore((state) => state.resumeGraph);
  const threadId = useCreationStore((state) => state.threadId);
  const setLoadingMessage = useCreationStore((state) => state.setLoadingMessage);
  const loadingMessage = useCreationStore((state) => state.loadingMessage);

  const onCancel = () => {
    closePortal();
  }
  const onImprove = async (note: string) => {
    setLoadingMessage("Submitting improvement note...");
    if (threadId) await resumeGraph(note, threadId, "outline_approval");
    closePortal();
  }

  return (
    <div className="w-full max-w-md mx-auto text-gray-200  p-6 flex flex-col gap-4">
      {/* Title */}
      <div className="flex justify-end">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
          Improvement Note
        </h2>
      </div>

      {/* Textarea */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What to improve"
        className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {/* Loading Message */}
      {loadingMessage && <LoadingMessage message={loadingMessage}/>}
      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={loadingMessage !== null}
          className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 active:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onImprove(note)}
          disabled={loadingMessage !== null || note.trim() === ""}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors"
        >
          Improve
        </button>
      </div>
    </div>
  );
}
