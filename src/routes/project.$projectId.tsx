import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Editor } from "@/components/editor/editor";

const searchSchema = z.object({ prompt: z.string().optional().catch("") });

export const Route = createFileRoute("/project/$projectId")({
  validateSearch: searchSchema,
  head: ({ params }) => ({
    meta: [
      { title: `${params.projectId.replaceAll("-", " ")} — Figurable.dev` },
      { name: "description", content: "Build, preview, and refine your project in Figurable.dev." },
      { property: "og:title", content: `${params.projectId.replaceAll("-", " ")} — Figurable.dev` },
      { property: "og:description", content: "Build, preview, and refine your project in Figurable.dev." },
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