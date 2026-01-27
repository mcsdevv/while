"use client";

import { FieldMappingEditor } from "@/components/settings/field-mapping-editor";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
  Skeleton,
} from "@while/ui";
import { useEffect, useState } from "react";

interface FieldMapping {
  title: string;
  date: string;
  description: string;
  location: string;
  gcalEventId: string;
  reminders: string;
}

export default function FieldMappingPage() {
  const [mapping, setMapping] = useState<FieldMapping | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMapping = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setMapping(data.fieldMapping);
      }
    } catch (error) {
      console.error("Error fetching field mapping:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapping();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Field Mapping</h1>
        <p className="text-muted-foreground mt-1">
          Configure how Notion properties map to Google Calendar fields
        </p>
      </div>

      {/* Info Card */}
      <GlassCard variant="subtle">
        <GlassCardHeader className="pb-3">
          <GlassCardTitle className="text-base">How it works</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <GlassCardDescription>
            Field mapping defines how data flows between your Notion database and
            Google Calendar. Each Notion property can be mapped to a corresponding
            calendar field. Changes are synchronized bidirectionally.
          </GlassCardDescription>
        </GlassCardContent>
      </GlassCard>

      {/* Field Mapping Editor */}
      <GlassCard variant="elevated">
        <GlassCardHeader>
          <GlassCardTitle>Property Mappings</GlassCardTitle>
          <GlassCardDescription>
            Select which Notion properties to use for each calendar field
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <FieldMappingEditor initialMapping={mapping} onSave={fetchMapping} />
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
