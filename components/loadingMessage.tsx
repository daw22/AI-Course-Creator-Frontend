"use client";

import { Loader2 } from "lucide-react";

export default function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-700">
      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      <span>{message}</span>
    </div>
  );
}