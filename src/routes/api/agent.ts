import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleAgentRequest } = await import("@/server/agent.server");
        return handleAgentRequest(request);
      },
    },
  },
});
