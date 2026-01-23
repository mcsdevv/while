"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ResetType = "mapping" | "sync" | "all";

export function DangerZone() {
  const router = useRouter();
  const [resetting, setResetting] = useState<ResetType | null>(null);
  const [confirmingReset, setConfirmingReset] = useState<ResetType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleReset = async (type: ResetType) => {
    if (confirmingReset !== type) {
      setConfirmingReset(type);
      setError(null);
      setSuccess(null);
      return;
    }

    setResetting(type);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/settings/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset");
      }

      setSuccess(data.message);
      setConfirmingReset(null);

      if (type === "all" && data.redirect) {
        setTimeout(() => {
          router.push(data.redirect);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset");
    } finally {
      setResetting(null);
    }
  };

  const handleCancel = () => {
    setConfirmingReset(null);
    setError(null);
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          These actions can affect your sync configuration. Proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reset Field Mapping */}
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
          <div>
            <h4 className="text-sm font-medium">Reset Field Mapping</h4>
            <p className="text-xs text-muted-foreground">
              Reset all field mappings to their default values
            </p>
          </div>
          {confirmingReset === "mapping" ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReset("mapping")}
                disabled={resetting === "mapping"}
              >
                {resetting === "mapping" ? "Resetting..." : "Confirm"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReset("mapping")}
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Clear Sync State */}
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
          <div>
            <h4 className="text-sm font-medium">Clear Sync State</h4>
            <p className="text-xs text-muted-foreground">
              Remove GCal Event IDs from Notion (may cause duplicates)
            </p>
          </div>
          {confirmingReset === "sync" ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReset("sync")}
                disabled={resetting === "sync"}
              >
                {resetting === "sync" ? "Clearing..." : "Confirm"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReset("sync")}
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Reset Everything */}
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
          <div>
            <h4 className="text-sm font-medium">Reset Everything</h4>
            <p className="text-xs text-muted-foreground">
              Delete all settings and return to setup wizard
            </p>
          </div>
          {confirmingReset === "all" ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReset("all")}
                disabled={resetting === "all"}
              >
                {resetting === "all" ? "Resetting..." : "Confirm Delete"}
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleReset("all")}
            >
              Delete All
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
