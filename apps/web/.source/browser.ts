// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"architecture.mdx": () => import("../content/docs/architecture.mdx?collection=docs"), "faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "quickstart.mdx": () => import("../content/docs/quickstart.mdx?collection=docs"), "setup/google.mdx": () => import("../content/docs/setup/google.mdx?collection=docs"), "setup/notion.mdx": () => import("../content/docs/setup/notion.mdx?collection=docs"), "setup/vercel.mdx": () => import("../content/docs/setup/vercel.mdx?collection=docs"), "guides/field-mapping.mdx": () => import("../content/docs/guides/field-mapping.mdx?collection=docs"), "guides/troubleshooting.mdx": () => import("../content/docs/guides/troubleshooting.mdx?collection=docs"), }),
};
export default browserCollections;