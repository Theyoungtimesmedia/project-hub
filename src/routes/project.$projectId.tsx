import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Editor } from "@/components/editor/editor";

const searchSchema = z.object({ prompt: z.string().optional().catch("") });

export const Route = createFileRoute("/project/$projectId")({
  validateSearch: searchSchema,
  head: ({ params }) => ({
    meta: [
      { title: `${params.projectId.replaceAll("-", " ")} — Lovable Studio` },
      { name: "description", content: "Build, preview, and refine your project in Lovable Studio." },
      { property: "og:title", content: `${params.projectId.replaceAll("-", " ")} — Lovable Studio` },
      { property: "og:description", content: "Build, preview, and refine your project in Lovable Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectEditorRoute,
});

function ProjectEditorRoute() {
  const { projectId } = Route.useParams();
  const { prompt } = Route.useSearch();
  return <Editor projectId={projectId} initialPrompt={prompt ?? ""}/>;
}