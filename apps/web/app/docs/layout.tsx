import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

const pageTree = source.getPageTree();
const nav = {
  title: "While",
  url: "/",
};
const links = [
  {
    text: "GitHub",
    url: "https://github.com/mcsdevv/while",
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={pageTree} nav={nav} links={links}>
      {children}
    </DocsLayout>
  );
}
