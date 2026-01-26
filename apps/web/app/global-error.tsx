"use client";

import "./globals.css";
import { ServerCrash } from "lucide-react";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 relative overflow-hidden">
          {/* Large background error code */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none animate-pulse-subtle">
            <span className="text-[120px] sm:text-[180px] font-semibold tracking-tighter text-foreground/5">
              500
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6 animate-float">
              <ServerCrash className="w-7 h-7 text-muted-foreground" />
            </div>

            {/* Text */}
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              Something went wrong
            </h1>
            <p className="text-muted-foreground text-base max-w-md mb-8">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {/* Actions - using native elements as fallback */}
            <div className="flex gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Go to Homepage
              </a>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>

            {/* Error digest */}
            {error.digest && (
              <p className="mt-6 text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
