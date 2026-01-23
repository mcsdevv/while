"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

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
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  const isConnected = status?.connected;

  const handleSaveCredentials = async () => {
    if (!clientId || !clientSecret) {
      setError("Please enter both Client ID and Client Secret");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/setup/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save credentials");
      }

      // Now start OAuth flow
      await handleConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      // Get OAuth URL
      const response = await fetch(`/api/setup/google?clientId=${encodeURIComponent(clientId)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get OAuth URL");
      }

      const { oauthUrl } = await response.json();

      // Redirect to Google OAuth
      window.location.href = oauthUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setConnecting(false);
    }
  };

  const loadCalendars = async () => {
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
  };

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
  if (isConnected && calendars.length === 0 && !loadingCalendars) {
    loadCalendars();
  }

  return (
    <div className="space-y-6">
      {!isConnected ? (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="clientId" className="text-sm font-medium">
                Google OAuth Client ID
              </label>
              <Input
                id="clientId"
                type="text"
                placeholder="xxx.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="clientSecret" className="text-sm font-medium">
                Google OAuth Client Secret
              </label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter your client secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <p className="font-medium">Important:</p>
              <p>Add this redirect URI to your Google Cloud OAuth credentials:</p>
              <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/setup/google/callback`
                  : "/api/setup/google/callback"}
              </code>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={handleSaveCredentials}
              disabled={saving || connecting || !clientId || !clientSecret}
            >
              {saving ? "Saving..." : connecting ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
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
              Select Calendar
            </span>
            <Select
              value={selectedCalendar}
              onValueChange={handleSelectCalendar}
              aria-labelledby="calendar-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a calendar" />
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
