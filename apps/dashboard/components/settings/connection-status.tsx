"use client";

import { getTokenHealth } from "@/lib/settings/token-health";
import { Button } from "@while/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@while/ui";
import { ConnectionStatusCard } from "@while/ui";
import { useState } from "react";

interface GoogleStatus {
  isConfigured: boolean;
  isConnected: boolean;
  calendarId: string | null;
  calendarName: string | null;
  connectedAt: string | null;
  oauthAppPublished?: boolean;
}

interface NotionStatus {
  databaseId: string | null;
  databaseName: string | null;
  isConnected: boolean;
}

interface ConnectionStatusProps {
  google: GoogleStatus | null;
  notion: NotionStatus | null;
}

interface TestResult {
  service: "Google Calendar" | "Notion";
  success: boolean;
  message: string;
  details?: string;
}

export function ConnectionStatus({ google, notion }: ConnectionStatusProps) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/settings/test", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to test connections");
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test connections");
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Unknown";
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Status</CardTitle>
        <CardDescription>Overview of your Google Calendar and Notion connections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Google Status */}
          {google?.isConnected ? (
            <ConnectionStatusCard
              title="Google Calendar"
              subtitle={
                google.calendarName ||
                (google.calendarId === "primary"
                  ? "Primary Calendar"
                  : google.calendarId || "Not selected")
              }
              subtitleLabel="Calendar"
            />
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-destructive/20">
                  <svg
                    className="h-5 w-5 text-destructive"
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div>
                    <span className="font-medium text-foreground">Google Calendar</span>
                    <span className="text-muted-foreground">: Not Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notion Status */}
          {notion?.isConnected ? (
            <ConnectionStatusCard
              title="Notion"
              subtitle={notion.databaseName || "Not selected"}
              subtitleLabel="Database"
            />
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-destructive/20">
                  <svg
                    className="h-5 w-5 text-destructive"
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div>
                    <span className="font-medium text-foreground">Notion</span>
                    <span className="text-muted-foreground">: Not Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.service}
                className={`rounded-lg border p-3 ${
                  result.success
                    ? "border-foreground/10 bg-foreground/5"
                    : "border-foreground/20 bg-foreground/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 text-foreground"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      result.success ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {result.service}: {result.message}
                  </span>
                </div>
                {result.details && (
                  <p className="mt-1 text-xs text-muted-foreground">{result.details}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <Button onClick={handleTest} disabled={testing} variant="outline" className="w-full">
          {testing ? "Testing..." : "Test Connections"}
        </Button>
      </CardContent>
    </Card>
  );
}
