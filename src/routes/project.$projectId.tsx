import { createFileRoute } from "@tanstack/react-router";
import { FigurableEditor } from "@/components/figurable-editor";

export const Route = createFileRoute("/project/$projectId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.projectId.replace(/-/g, " ")} — Figurable.dev` },
      {
        name: "description",
        content: "Focused AI development workspace for building, planning, previewing and visually editing projects.",
      },
    ],
  }),
  component: FigurableEditor,
});
