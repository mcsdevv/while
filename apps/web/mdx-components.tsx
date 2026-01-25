import defaultMdxComponents from "fumadocs-ui/mdx";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "fumadocs-ui/components/callout";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Mermaid } from "@/components/mdx/mermaid";
import { FAQAccordion, FAQAccordionItem } from "@/components/mdx/faq-accordion";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    Callout,
    Card,
    Cards,
    FAQAccordion,
    FAQAccordionItem,
    Mermaid,
    Step,
    Steps,
    ...components,
  };
}
