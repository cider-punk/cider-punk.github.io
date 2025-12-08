import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"
import { FileTrieNode } from './quartz/util/fileTrie';

const recentEntries = Component.Flex({
  components: [
    {
      Component: Component.RecentNotes({
        title: "Recent Posts",
        limit: 3,
        showTags: false,
        filter: (f) =>
          f.slug!.startsWith("blog/") && f.slug! !== "blog/index" && !f.frontmatter?.noindex,
        linkToMore: "blog/" as SimpleSlug,
      }),
    },
    {
      Component: Component.RecentNotes({
        title: "Recently Edited Notes",
        limit: 3,
        showTags: false,
        filter: (f) => f.slug!.startsWith("notes/") && f.slug! !== "notes/index",
        linkToMore: "notes/" as SimpleSlug,
      }),
    },
  ],
})

// source: https://github.com/fanteastick/quartz-test/blob/edfa441db4cabb6cbd5078edcabab405701752df/quartz.layout.ts#L43
const explorerConfig = {
  filterFn: (node: FileTrieNode) => {
    const omit = new Set(["tags"]);
    const hasExcludedTag = node.data?.tags?.includes("explorer-exclude") === true;
    const isOmitted = omit.has(node.displayName?.toLowerCase());
    return !hasExcludedTag && !isOmitted;
  },
  mapFn: (node: FileTrieNode) => {
    // dont change name of root node
    if (!node.isFolder) {
      // set emoji for file/folder
        node.displayName = "⚍ " + node.displayName
    }
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: recentEntries,
      condition: (page) => page.fileData.slug === "index",
    }),
  ], // default: []
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/cider-punk/cider-punk.github.io",
    },
  }),
}

const left = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [
      {
        Component: Component.Search(),
        grow: true,
      },
      { Component: Component.Darkmode() },
      { Component: Component.DesktopOnly(Component.ReaderMode()) },
    ],
  }),
  // ...recentNotes.map((c) => Component.DesktopOnly(c)),
  Component.ConditionalRender({
    component: Component.Explorer(explorerConfig),
    condition: (page) => page.fileData.slug === "index",
  }),
  Component.DesktopOnly(
    Component.ConditionalRender({
      component: Component.TableOfContents(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ),

  Component.FloatingButtons({ position: "right" }),
]

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ showCurrentPage: false }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left,
  right: [
    Component.Graph({
      localGraph: {
        showTags: true,
      },
      globalGraph: {
        showTags: true,
      },
    }),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left,
  right: [],
}
