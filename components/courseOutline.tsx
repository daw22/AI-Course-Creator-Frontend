"use client";

import useCreationStore from "@/state/creationState";
import useGraphHistoryStore from "@/state/graphHistory";
import usePortalStore from "@/state/portal";
import { useRouter } from "next/navigation";

export default function CourseOutline() {
  const router = useRouter();
  const outline = useCreationStore((state) => state.courseOutline); 
  const history = useGraphHistoryStore((state) => state.history);
  const openPortal = usePortalStore((state) => state.openPortal);

  const onImprove = () => {
    openPortal("improveOutline");
  }
  const onContinue = () => {
    router.push("/CourseContent/" + (history.length > 0 ? history[history.length -1].threadId : ""));
  }
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-3 text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Your Course Outline</h1>
      <div className="w-full max-h-[50vh] overflow-y-auto rounded-2xl bg-neutral-900 shadow-md border border-neutral-800 p-4 space-y-6">
        {outline?.chapters.map((chapter, cIndex) => (
          <div key={cIndex}>
            {/* Chapter title + tooltip */}
            <div className="relative group inline-block">
              <h2 className="text-lg font-semibold text-blue-400 mb-2 cursor-pointer">
                {cIndex + 1}. {chapter.chapter_title}
              </h2>

              {chapter.chapter_target && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-neutral-800 text-gray-100 text-xs p-2 rounded-lg shadow-lg border border-neutral-700 w-max max-w-xs z-10">
                  {chapter.chapter_target}
                </div>
              )}
            </div>

            {/* Subtopics */}
            <ul className="ml-5 space-y-1">
              {chapter.subtopics.map((sub, sIndex) => (
                <li key={sIndex} className="text-gray-300 text-sm relative group cursor-pointer w-fit">
                  <span className="font-medium text-blue-500">
                    {cIndex + 1}.{sIndex + 1}.
                  </span>{" "}
                  {sub.subtopic_title}

                  {sub.subtopic_target && (
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-neutral-800 text-gray-100 text-xs p-2 rounded-lg shadow-lg border border-neutral-700 w-max max-w-xs z-10">
                      {sub.subtopic_target}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between w-full mt-6">
        <button
          onClick={onImprove}
          className="px-6 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 active:bg-gray-700 transition-colors cursor-pointer"
        >
          Improve Outline
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors cursor-pointer"
        >
          Start Learning →
        </button>
      </div>
    </div>
  );
}
