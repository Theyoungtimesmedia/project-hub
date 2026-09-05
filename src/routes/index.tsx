import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceShell } from "@/components/workspace-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Joshua's workspace" },
      { name: "description", content: "Build, organize, and manage your projects in a private Lovable-style workspace." },
      { property: "og:title", content: "Dashboard — Joshua's workspace" },
      { property: "og:description", content: "Build, organize, and manage your projects in a private Lovable-style workspace." },
    ],
  }),
  component: WorkspaceShell,
});
