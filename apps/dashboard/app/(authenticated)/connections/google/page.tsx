"use client";

import { GoogleSettings } from "@/components/settings/google-settings";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  Skeleton,
} from "@while/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface GoogleStatus {
  isConfigured: boolean;
  isConnected: boolean;
  calendarId: string | null;
  calendarName: string | null;
  connectedAt: string | null;
}

export default function GoogleConnectionPage() {
  const [settings, setSettings] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data.google);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Back link */}
      <Link
        href="/connections"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Connections
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Google Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your Google Calendar connection
        </p>
      </div>

      {/* Settings Card */}
      <GlassCard variant="elevated">
        <GlassCardHeader>
          <GlassCardTitle>Connection Details</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <GoogleSettings settings={settings} />
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
