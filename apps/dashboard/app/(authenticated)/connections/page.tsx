"use client";

import {
  Badge,
  Button,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
  Skeleton,
} from "@while/ui";
import { Calendar, Database, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ConnectionsStatus {
  google: {
    isConfigured: boolean;
    isConnected: boolean;
    calendarName: string | null;
  } | null;
  notion: {
    isConnected: boolean;
    databaseName: string | null;
  } | null;
}

export default function ConnectionsPage() {
  const [status, setStatus] = useState<ConnectionsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setStatus({
            google: data.google,
            notion: data.notion,
          });
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Connections</h1>
        <p className="text-muted-foreground mt-1">
          Manage your service integrations
        </p>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar */}
        <GlassCard interactive className="group">
          <Link href="/connections/google" className="block">
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-glass bg-foreground/5 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <GlassCardTitle>Google Calendar</GlassCardTitle>
                    <GlassCardDescription>
                      {status?.google?.calendarName || "Not connected"}
                    </GlassCardDescription>
                  </div>
                </div>
                <Badge
                  variant={status?.google?.isConnected ? "success" : "secondary"}
                >
                  {status?.google?.isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-sm text-muted-foreground">
                Sync events between your Google Calendar and Notion database.
              </p>
              <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Manage connection</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </GlassCardContent>
          </Link>
        </GlassCard>

        {/* Notion */}
        <GlassCard interactive className="group">
          <Link href="/connections/notion" className="block">
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-glass bg-foreground/5 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <GlassCardTitle>Notion</GlassCardTitle>
                    <GlassCardDescription>
                      {status?.notion?.databaseName || "Not connected"}
                    </GlassCardDescription>
                  </div>
                </div>
                <Badge
                  variant={status?.notion?.isConnected ? "success" : "secondary"}
                >
                  {status?.notion?.isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-sm text-muted-foreground">
                Connect to your Notion workspace and select a database to sync.
              </p>
              <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Manage connection</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </GlassCardContent>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
