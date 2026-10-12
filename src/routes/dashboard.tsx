import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Workspace — Figurable.dev" },
      { name: "description", content: "Open and manage your projects in Figurable.dev." },
      { property: "og:title", content: "Workspace — Figurable.dev" },
      { property: "og:description", content: "Open and manage your projects in Figurable.dev." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});