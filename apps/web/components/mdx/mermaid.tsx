"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (
    id: string,
    text: string,
  ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
};

let mermaidPromise: Promise<MermaidApi> | null = null;

async function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import(/* webpackIgnore: true */ MERMAID_CDN_URL).then((mod: unknown) => {
      const api = (mod as { default?: unknown } | null)?.default as MermaidApi | undefined;
      if (!api?.initialize || !api?.render) {
        throw new Error("Failed to load Mermaid");
      }
      return api;
    });
  }
  return mermaidPromise;
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      setSvg(null);
      setError(null);

      try {
        const mermaid = await loadMermaid();

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "inherit",
          theme: resolvedTheme === "dark" ? "dark" : "default",
        });

        const elementId = `mermaid-${id.replace(/:/g, "-")}`;

        const { svg: renderedSvg } = await mermaid.render(elementId, chart.trim());
        if (cancelled) return;
        setSvg(renderedSvg);
      } catch (error) {
        console.error("Mermaid rendering failed:", error);
        if (cancelled) return;
        setError(error instanceof Error ? error.message : "Mermaid rendering failed");
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, id]);

  if (!svg && !error) {
    return <div className="animate-pulse h-32 bg-muted rounded" />;
  }

  if (error) {
    return (
      <div className="my-6 overflow-x-auto rounded border bg-muted/30 p-4 text-sm">
        <p className="font-medium">Mermaid diagram failed to render</p>
        <pre className="mt-3 whitespace-pre text-muted-foreground">{chart}</pre>
      </div>
    );
  }

  // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid outputs SVG from trusted, static MDX content.
  return <div className="my-6 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg ?? "" }} />;
}
