"use client";
import React from "react";
import { X } from "lucide-react";
import usePortalStore from "@/state/portal";
import useCreationStore from "@/state/creationState";

export default function Portal({ children, title }: any) {
  const type = usePortalStore((state) => state.type);
  const close = usePortalStore((state) => state.closePortal);
  const currentState = useCreationStore((state) => state.currentState);

  if (type === null) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Portal Container */}
      <div className="bg-black border border-gray-600 w-full max-w-md relative animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          {title && <h2 className="text-xl font-light tracking-wider text-white">{title}</h2>}
          <button
            onClick={close}
            disabled={currentState === "outline"}
            className="text-gray-400 hover:text-white transition-colors ml-auto"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}



