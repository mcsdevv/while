"use client";

import { Button } from "@notion-gcal-sync/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      {/* Animated icon with radar pulse */}
      <div className="relative mb-8">
        {/* Radar pulse rings */}
        <div
          className="absolute inset-0 rounded-full bg-muted-foreground/10"
          style={{
            animation: "radar 2s ease-out infinite",
          }}
        />
        <div
          className="absolute inset-0 rounded-full bg-muted-foreground/10"
          style={{
            animation: "radar 2s ease-out infinite 0.5s",
          }}
        />
        <div
          className="absolute inset-0 rounded-full bg-muted-foreground/10"
          style={{
            animation: "radar 2s ease-out infinite 1s",
          }}
        />

        {/* Icon container */}
        <div className="relative w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-9 h-9 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        We couldn&apos;t find what you&apos;re looking for. It may have been moved or doesn&apos;t
        exist.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          Go Back
        </Button>
        <Button asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes radar {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
