"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@notion-gcal-sync/ui";
import type { SyncMetrics } from "@/lib/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface OperationsBreakdownChartProps {
  metrics: SyncMetrics | null;
}

export function OperationsBreakdownChart({ metrics }: OperationsBreakdownChartProps) {
  if (!metrics) {
    return null;
  }

  const data = [
    { name: "Creates", value: metrics.operationCounts.creates },
    { name: "Updates", value: metrics.operationCounts.updates },
    { name: "Deletes", value: metrics.operationCounts.deletes },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const COLORS = [
    "hsl(var(--chart-1))", // Creates - green
    "hsl(var(--chart-2))", // Updates - blue
    "hsl(var(--chart-3))", // Deletes - red
  ];

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operations Breakdown</CardTitle>
          <CardDescription>No operations recorded yet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground">Sync operations will appear here</p>
        </CardContent>
      </Card>
    );
  }

  interface TooltipPayload {
    name: string;
    value: number;
    payload: { name: string; value: number };
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">{payload[0].name}</span>
              <span className="text-sm font-bold">{payload[0].value}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Breakdown</CardTitle>
        <CardDescription>{total} total operations</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={90}
              fill="hsl(var(--primary))"
              dataKey="value"
              className="text-xs font-medium"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index]}
                  className="stroke-background"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-sm text-muted-foreground">
                {entry.name}
                <span className="ml-1 font-medium text-foreground">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
