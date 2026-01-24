"use client";

import { Button } from "@while/ui";
import { Input } from "@while/ui";
import { useEffect, useState } from "react";

interface FieldMappingStepProps {
  onBack: () => void;
  onNext: () => void;
}

interface FieldMapping {
  title: string;
  date: string;
  description: string;
  location: string;
  gcalEventId: string;
  reminders: string;
}

const FIELD_DESCRIPTIONS: Record<keyof FieldMapping, string> = {
  title: "The property containing the event title (required)",
  date: "The date property for event timing (required)",
  description: "The property for event description (optional)",
  location: "The property for event location (optional)",
  gcalEventId: "Property to store Google Calendar event ID (optional)",
  reminders: "Property for reminder minutes (optional)",
};

export function FieldMappingStep({ onBack, onNext }: FieldMappingStepProps) {
  const [mapping, setMapping] = useState<FieldMapping>({
    title: "Title",
    date: "Date",
    description: "Description",
    location: "Location",
    gcalEventId: "GCal Event ID",
    reminders: "Reminders",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMapping() {
      try {
        const response = await fetch("/api/setup/field-mapping");
        if (response.ok) {
          const data = await response.json();
          setMapping(data.fieldMapping);
        }
      } catch (err) {
        console.error("Failed to load field mapping:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMapping();
  }, []);

  const handleChange = (field: keyof FieldMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!mapping.title || !mapping.date) {
      setError("Title and Date fields are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/setup/field-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapping),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save field mapping");
      }

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save field mapping");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Map your Notion database property names to Google Calendar fields. Enter the exact property
        names as they appear in your Notion database.
      </div>

      <div className="space-y-4">
        {(Object.keys(mapping) as Array<keyof FieldMapping>).map((field) => (
          <div key={field} className="space-y-1">
            <div className="flex items-center gap-2">
              <label htmlFor={field} className="text-sm font-medium capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {(field === "title" || field === "date") && (
                <span className="text-xs text-destructive">*</span>
              )}
            </div>
            <Input
              id={field}
              type="text"
              placeholder={`Notion property name for ${field}`}
              value={mapping[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{FIELD_DESCRIPTIONS[field]}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
