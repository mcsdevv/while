import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import type { TOCItemType } from "fumadocs-core/toc";
import type { MDXContent } from "mdx/types";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  // Type assertion needed for async fumadocs-mdx collections
  const pageData = page.data as typeof page.data & {
    load: () => Promise<{ body: MDXContent; toc: TOCItemType[] }>;
  };
  const { body: Mdx, toc } = await pageData.load();

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <Mdx components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
