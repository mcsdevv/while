"use client";

import { Badge } from "@notion-gcal-sync/ui";
import { Button } from "@notion-gcal-sync/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@notion-gcal-sync/ui";
import { useRouter } from "next/navigation";

interface GoogleSettingsProps {
  settings: {
    clientId: string;
    calendarId: string | null;
    connectedAt: string | null;
    isConnected: boolean;
  } | null;
}

export function GoogleSettings({ settings }: GoogleSettingsProps) {
  const router = useRouter();

  const handleReconnect = () => {
    router.push("/setup?step=google");
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>Manage your Google Calendar connection</CardDescription>
          </div>
          <Badge variant={settings?.isConnected ? "success" : "destructive"}>
            {settings?.isConnected ? "Connected" : "Not Connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings?.isConnected ? (
          <>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                <span className="text-muted-foreground">Client ID</span>
                <span className="font-mono truncate">{settings.clientId || "Not configured"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                <span className="text-muted-foreground">Calendar</span>
                <span className="truncate">{settings.calendarId || "Not selected"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                <span className="text-muted-foreground">Connected</span>
                <span>{formatDate(settings.connectedAt)}</span>
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" onClick={handleReconnect} className="w-full">
                Reconnect Google Calendar
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Google Calendar is not connected. Complete the setup to start syncing events.
            </p>
            <Button onClick={handleReconnect}>Connect Google Calendar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
