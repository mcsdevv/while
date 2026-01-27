import { EnvVarsTable } from "@/components/mdx/env-vars-table";
import { FAQAccordion, FAQAccordionItem } from "@/components/mdx/faq-accordion";
import { Mermaid } from "@/components/mdx/mermaid";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "fumadocs-ui/components/callout";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

const baseComponents: MDXComponents = {
  ...defaultMdxComponents,
  Accordion,
  Accordions,
  Callout,
  Card,
  Cards,
  EnvVarsTable,
  FAQAccordion,
  FAQAccordionItem,
  Mermaid,
  Step,
  Steps,
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  if (!components) return baseComponents;
  return { ...baseComponents, ...components };
}
