"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@while/ui";
import { Check, Circle } from "lucide-react";
import * as React from "react";

interface SetupChecklistItemProps {
  children: React.ReactNode;
  defaultChecked?: boolean;
}

export function SetupChecklistItem({ children, defaultChecked = false }: SetupChecklistItemProps) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className={`flex items-start gap-3 w-full text-left py-2 px-3 rounded-lg transition-colors ${
        checked ? "bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <span className="mt-0.5 shrink-0">
        {checked ? (
          <Check className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </span>
      <span
        className={`text-sm ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}
      >
        {children}
      </span>
    </button>
  );
}

interface SetupChecklistProps {
  title?: string;
  children: React.ReactNode;
}

export function SetupChecklist({ title = "Setup Checklist", children }: SetupChecklistProps) {
  return (
    <Card className="not-prose">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">{children}</CardContent>
    </Card>
  );
}
