import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Workspace — Lovable Studio" },
      { name: "description", content: "Open and manage your projects in Lovable Studio." },
      { property: "og:title", content: "Workspace — Lovable Studio" },
      { property: "og:description", content: "Open and manage your projects in Lovable Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});