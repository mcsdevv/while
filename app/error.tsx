"use client";

import { Button } from "@/components/ui/button";
import { Unplug } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      {/* Animated icon with shake effect */}
      <div className="relative mb-8">
        {/* Pulsing ring behind icon */}
        <div
          className="absolute inset-0 rounded-full bg-destructive/20"
          style={{
            animation: "pulse-ring 2s ease-in-out infinite",
          }}
        />

        {/* Icon container with shake */}
        <div
          className="relative w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
          style={{
            animation: "shake 0.5s ease-in-out infinite",
            animationDelay: "2s",
            animationIterationCount: "3",
          }}
        >
          <Unplug className="w-9 h-9 text-destructive" />
        </div>
      </div>

      {/* Content */}
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        We hit an unexpected error. Our sync gremlins are on it.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          20% {
            transform: translateX(-3px) rotate(-5deg);
          }
          40% {
            transform: translateX(3px) rotate(5deg);
          }
          60% {
            transform: translateX(-3px) rotate(-5deg);
          }
          80% {
            transform: translateX(3px) rotate(5deg);
          }
        }

        @keyframes pulse-ring {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
}
