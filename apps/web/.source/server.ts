// @ts-nocheck
import { frontmatter as __fd_glob_11 } from "../content/docs/guides/troubleshooting.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_10 } from "../content/docs/guides/field-mapping.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_9 } from "../content/docs/setup/vercel.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_8 } from "../content/docs/setup/notion.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_7 } from "../content/docs/setup/google.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_6 } from "../content/docs/quickstart.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_5 } from "../content/docs/index.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_4 } from "../content/docs/faq.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_3 } from "../content/docs/architecture.mdx?collection=docs&only=frontmatter"
import { default as __fd_glob_2 } from "../content/docs/guides/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/setup/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docsLazy("docs", "content/docs", {"meta.json": __fd_glob_0, "setup/meta.json": __fd_glob_1, "guides/meta.json": __fd_glob_2, }, {"architecture.mdx": __fd_glob_3, "faq.mdx": __fd_glob_4, "index.mdx": __fd_glob_5, "quickstart.mdx": __fd_glob_6, "guides/field-mapping.mdx": __fd_glob_7, "guides/troubleshooting.mdx": __fd_glob_8, "setup/google.mdx": __fd_glob_9, "setup/notion.mdx": __fd_glob_10, "setup/vercel.mdx": __fd_glob_11, }, {"architecture.mdx": () => import("../content/docs/architecture.mdx?collection=docs"), "faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "quickstart.mdx": () => import("../content/docs/quickstart.mdx?collection=docs"), "guides/field-mapping.mdx": () => import("../content/docs/guides/field-mapping.mdx?collection=docs"), "guides/troubleshooting.mdx": () => import("../content/docs/guides/troubleshooting.mdx?collection=docs"), "setup/google.mdx": () => import("../content/docs/setup/google.mdx?collection=docs"), "setup/notion.mdx": () => import("../content/docs/setup/notion.mdx?collection=docs"), "setup/vercel.mdx": () => import("../content/docs/setup/vercel.mdx?collection=docs"), });
