"use client";

import { LogsViewer } from "@/components/dashboard/logs-viewer";
import type { SyncMetrics } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@while/ui";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@while/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@while/ui";
import { Separator } from "@while/ui";
import { Skeleton } from "@while/ui";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lazy load the chart component to code-split recharts (~40KB)
const ActivityTimelineChart = dynamic(
  () =>
    import("@/components/dashboard/activity-timeline-chart").then(
      (mod) => mod.ActivityTimelineChart,
    ),
  {
    ssr: false,
    loading: () => (
      <GlassCard>
        <GlassCardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </GlassCardHeader>
        <GlassCardContent>
          <Skeleton className="h-[300px] w-full" />
        </GlassCardContent>
      </GlassCard>
    ),
  },
);

type TimeWindow = "24h" | "7d" | "30d" | "90d";

export function Dashboard() {
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [status, setStatus] = useState<{
    healthy: boolean;
    message: string;
    lastSync: {
      notionToGcal: string | null;
      gcalToNotion: string | null;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("24h");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, statusRes] = await Promise.all([
          fetch(`/api/metrics?window=${timeWindow}`),
          fetch("/api/status"),
        ]);

        const [metricsData, statusData] = await Promise.all([metricsRes.json(), statusRes.json()]);

        setMetrics(metricsData);
        setStatus(statusData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeWindow]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const successRateNumeric = metrics
    ? metrics.totalSuccess + metrics.totalFailures > 0
      ? (metrics.totalSuccess / (metrics.totalSuccess + metrics.totalFailures)) * 100
      : null
    : null;

  const successRate = successRateNumeric !== null ? successRateNumeric.toFixed(1) : "N/A";

  const getHealthBadgeVariant = (): "success" | "warning" | "destructive" => {
    if (successRateNumeric === null) return "success";
    if (successRateNumeric > 99) return "success";
    if (successRateNumeric >= 90) return "warning";
    return "destructive";
  };

  const getSuccessRateColor = (): string => {
    if (successRateNumeric === null) return "";
    if (successRateNumeric > 99) return "text-foreground";
    if (successRateNumeric >= 90) return "text-muted-foreground";
    return "text-foreground/60";
  };

  const timeWindowLabels: Record<TimeWindow, string> = {
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time synchronization overview
          </p>
        </div>
        <Select
          value={timeWindow}
          onValueChange={(value) => setTimeWindow(value as TimeWindow)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">{timeWindowLabels["24h"]}</SelectItem>
            <SelectItem value="7d">{timeWindowLabels["7d"]}</SelectItem>
            <SelectItem value="30d">{timeWindowLabels["30d"]}</SelectItem>
            <SelectItem value="90d">{timeWindowLabels["90d"]}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Overview */}
      <GlassCard variant="elevated">
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <GlassCardTitle>System Status</GlassCardTitle>
            <Badge variant={getHealthBadgeVariant()}>
              {successRateNumeric !== null && successRateNumeric > 99
                ? "Healthy"
                : successRateNumeric !== null && successRateNumeric >= 90
                  ? "Degraded"
                  : "Issues Detected"}
            </Badge>
          </div>
          <GlassCardDescription>{status?.message}</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-subtle rounded-glass p-4">
                <p className="text-sm text-muted-foreground">Last Sync: Notion → GCal</p>
                <p className="text-lg font-medium mt-1">
                  {status?.lastSync.notionToGcal
                    ? formatDate(new Date(status.lastSync.notionToGcal))
                    : "Never"}
                </p>
              </div>
              <div className="glass-subtle rounded-glass p-4">
                <p className="text-sm text-muted-foreground">Last Sync: GCal → Notion</p>
                <p className="text-lg font-medium mt-1">
                  {status?.lastSync.gcalToNotion
                    ? formatDate(new Date(status.lastSync.gcalToNotion))
                    : "Never"}
                </p>
              </div>
            </div>

            {!status?.healthy && metrics && (
              <div className="rounded-glass border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                <p className="text-sm font-medium text-destructive">
                  {metrics.totalFailures} sync{" "}
                  {metrics.totalFailures === 1 ? "failure" : "failures"} detected
                </p>
                {metrics.recentLogs.filter((log) => log.status === "failure").slice(0, 3).length >
                  0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Recent errors:</p>
                    {metrics.recentLogs
                      .filter((log) => log.status === "failure")
                      .slice(0, 3)
                      .map((log) => (
                        <p key={log.id} className="text-xs text-destructive">
                          {log.eventTitle}: {log.error || "Unknown error"}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Metrics Grid - interactive glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard interactive className="group">
          <GlassCardHeader className="pb-2">
            <GlassCardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Success Rate
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className={`text-3xl font-semibold ${getSuccessRateColor()}`}>{successRate}%</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard interactive className="group">
          <GlassCardHeader className="pb-2">
            <GlassCardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Total Synced
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-semibold">{metrics?.totalSuccess || 0}</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard interactive className="group">
          <GlassCardHeader className="pb-2">
            <GlassCardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Failures
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-semibold">{metrics?.totalFailures || 0}</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard interactive className="group">
          <GlassCardHeader className="pb-2">
            <GlassCardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Total Operations
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-semibold">
              {(metrics?.totalSuccess || 0) + (metrics?.totalFailures || 0)}
            </p>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Charts */}
      <GlassCard>
        <ActivityTimelineChart metrics={metrics} timeWindow={timeWindow} />
      </GlassCard>

      <Separator className="bg-glass-border" />

      {/* Logs Viewer */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Recent Activity</GlassCardTitle>
          <GlassCardDescription>Sync events from the selected time period</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <LogsViewer logs={metrics?.recentLogs || []} />
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
