"use client";

import "@/app/globals.css";
import { Unplug } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
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
            We hit an unexpected error. Please try refreshing the page.
          </p>

          {/* Actions - using native buttons since UI components may not load */}
          <div className="flex gap-3">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Back to Dashboard
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>

          {/* Keyframe animations */}
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              20% { transform: translateX(-3px) rotate(-5deg); }
              40% { transform: translateX(3px) rotate(5deg); }
              60% { transform: translateX(-3px) rotate(-5deg); }
              80% { transform: translateX(3px) rotate(5deg); }
            }

            @keyframes pulse-ring {
              0%, 100% { transform: scale(1); opacity: 0.2; }
              50% { transform: scale(1.1); opacity: 0.1; }
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}
