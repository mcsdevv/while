"use client";

import { Button } from "@while/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@while/ui";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface GoogleStepProps {
  status?: {
    configured: boolean;
    connected: boolean;
    calendarSelected: boolean;
  };
  onBack: () => void;
  onNext: () => void;
}

interface Calendar {
  id: string;
  name: string;
  primary: boolean;
}

export function GoogleStep({ status, onBack, onNext }: GoogleStepProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  const isConnected = status?.connected;

  const handleSignIn = async () => {
    setConnecting(true);
    setError(null);

    try {
      // Trigger NextAuth sign-in with Google
      // This will redirect to Google, get consent, store refresh token, and redirect back
      await signIn("google", { callbackUrl: "/setup?google=connected" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setConnecting(false);
    }
  };

  const loadCalendars = useCallback(async () => {
    setLoadingCalendars(true);
    try {
      const response = await fetch("/api/setup/google/calendars");
      if (response.ok) {
        const data = await response.json();
        setCalendars(data.calendars);
        if (data.selectedCalendarId) {
          setSelectedCalendar(data.selectedCalendarId);
        }
      }
    } catch (err) {
      console.error("Failed to load calendars:", err);
    } finally {
      setLoadingCalendars(false);
    }
  }, []);

  const handleSelectCalendar = async (calendarId: string) => {
    setSelectedCalendar(calendarId);
    try {
      const response = await fetch("/api/setup/google/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId }),
      });

      if (!response.ok) {
        throw new Error("Failed to select calendar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select calendar");
    }
  };

  // Load calendars if already connected
  useEffect(() => {
    if (isConnected && calendars.length === 0 && !loadingCalendars) {
      loadCalendars();
    }
  }, [isConnected, calendars.length, loadingCalendars, loadCalendars]);

  return (
    <div className="space-y-6">
      {!isConnected ? (
        <>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to grant calendar access. This allows While to sync
              events between Notion and Google Calendar.
            </p>

            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">What permissions are requested:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>View and edit your Google Calendar events</li>
                <li>Access your email address for authentication</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSignIn} disabled={connecting}>
              {connecting ? "Connecting..." : "Sign in with Google"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Google Calendar connected</span>
            </div>
          </div>

          <div className="space-y-2">
            <span id="calendar-label" className="text-sm font-medium">
              Select Calendar to Sync
            </span>
            <p className="text-sm text-muted-foreground">
              Choose which Google Calendar to sync with your Notion database.
            </p>
            <Select
              value={selectedCalendar}
              onValueChange={handleSelectCalendar}
              aria-labelledby="calendar-label"
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingCalendars ? "Loading calendars..." : "Select a calendar"}
                />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((cal) => (
                  <SelectItem key={cal.id} value={cal.id}>
                    {cal.name} {cal.primary && "(Primary)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext} disabled={!selectedCalendar}>
              Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
