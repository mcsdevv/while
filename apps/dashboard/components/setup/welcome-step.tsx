"use client";

import { Button } from "@notion-gcal-sync/ui";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-muted-foreground">
          This wizard will help you connect your Google Calendar and Notion database for
          bidirectional synchronization.
        </p>

        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium">Prerequisites</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>
                A Google Cloud project with Calendar API enabled and OAuth 2.0 credentials.{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Create credentials
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>
                A Notion integration with access to your calendar database.{" "}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Create integration
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>
                Share your Notion database with the integration (click "..." menu in the database,
                then "Connections").
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <h3 className="font-medium">What you'll configure</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>- Google Calendar OAuth connection</li>
            <li>- Notion API integration</li>
            <li>- Field mapping between Notion properties and Google Calendar</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Get Started</Button>
      </div>
    </div>
  );
}
