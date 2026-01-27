"use client";

import { NotionSettings } from "@/components/settings/notion-settings";
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

interface NotionStatus {
  databaseId: string | null;
  databaseName: string | null;
  isConnected: boolean;
}

export default function NotionConnectionPage() {
  const [settings, setSettings] = useState<NotionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data.notion);
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
        <h1 className="text-3xl font-semibold tracking-tight">Notion</h1>
        <p className="text-muted-foreground mt-1">
          Manage your Notion workspace connection
        </p>
      </div>

      {/* Settings Card */}
      <GlassCard variant="elevated">
        <GlassCardHeader>
          <GlassCardTitle>Connection Details</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <NotionSettings settings={settings} />
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
