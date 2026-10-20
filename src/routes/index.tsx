import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/components/editor/editor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Editor — Lovable Studio" },
      { name: "description", content: "Build, preview, and refine a project in the Lovable Studio editor." },
      { property: "og:title", content: "Project Editor — Lovable Studio" },
      { property: "og:description", content: "Build, preview, and refine a project in the Lovable Studio editor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Editor projectId="orbit-finance"/>,
});
