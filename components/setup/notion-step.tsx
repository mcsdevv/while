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

interface NotionStepProps {
  status?: {
    configured: boolean;
    databaseSelected: boolean;
    databaseName: string | null;
  };
  onBack: () => void;
  onNext: () => void;
}

interface Database {
  id: string;
  name: string;
}

export function NotionStep({ status, onBack, onNext }: NotionStepProps) {
  const [apiToken, setApiToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [validated, setValidated] = useState(status?.configured || false);
  const [selectingDb, setSelectingDb] = useState(false);

  const handleValidateToken = async () => {
    if (!apiToken) {
      setError("Please enter your Notion API token");
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/setup/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate token");
      }

      setDatabases(data.databases);
      setValidated(true);

      if (data.databases.length === 0) {
        setError(
          "No databases found. Make sure you've shared at least one database with your integration.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate token");
    } finally {
      setValidating(false);
    }
  };

  const handleSelectDatabase = async (databaseId: string) => {
    setSelectedDatabase(databaseId);
    setSelectingDb(true);
    setError(null);

    try {
      const response = await fetch("/api/setup/notion/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to select database");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select database");
      setSelectedDatabase("");
    } finally {
      setSelectingDb(false);
    }
  };

  // If already configured with a database, show success state
  if (status?.databaseSelected && status?.databaseName) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Notion connected</span>
          </div>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Database: {status.databaseName}
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!validated ? (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiToken" className="text-sm font-medium">
                Notion API Token
              </label>
              <Input
                id="apiToken"
                type="password"
                placeholder="secret_xxx..."
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your token from{" "}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Notion Integrations
                </a>
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <p className="font-medium">Important:</p>
              <p>
                After creating an integration, you must share your database with it. Open your
                database in Notion, click "..." menu, then "Connections", and add your integration.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleValidateToken} disabled={validating || !apiToken}>
              {validating ? "Validating..." : "Validate Token"}
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
              <span className="font-medium">Token validated</span>
            </div>
          </div>

          <div className="space-y-2">
            <span id="database-label" className="text-sm font-medium">
              Select Database
            </span>
            <Select
              value={selectedDatabase}
              onValueChange={handleSelectDatabase}
              disabled={selectingDb}
              aria-labelledby="database-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a database" />
              </SelectTrigger>
              <SelectContent>
                {databases.map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    {db.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {databases.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No databases found. Make sure you've shared at least one database with your
                integration.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext} disabled={!selectedDatabase || selectingDb}>
              {selectingDb ? "Saving..." : "Continue"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
