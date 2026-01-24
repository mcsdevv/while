"use client";

import dynamic from "next/dynamic";

const MermaidDynamic = dynamic(
  () => import("./mermaid").then((mod) => mod.Mermaid),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-32 bg-muted rounded" />,
  }
);

export function Mermaid({ chart }: { chart: string }) {
  return <MermaidDynamic chart={chart} />;
}
