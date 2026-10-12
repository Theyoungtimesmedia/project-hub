import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Figurable.dev — Your build workspace" },
      { name: "description", content: "A focused workspace to plan, build, preview, and refine your projects." },
      { property: "og:title", content: "Figurable.dev — Your build workspace" },
      { property: "og:description", content: "A focused workspace to plan, build, preview, and refine your projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
