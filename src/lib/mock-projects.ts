export type Project = {
  id: string;
  name: string;
  description: string;
  owner: string;
  updatedAt: string;
  updatedLabel: string;
  published?: boolean;
  starred: boolean;
  access: "Owned by me" | "Shared with me";
  tone: "violet" | "coral" | "mint" | "blue" | "amber" | "rose" | "slate";
  folder?: string;
};

export type Workspace = {
  id: string;
  name: string;
  initials: string;
  plan: string;
  projects: Project[];
};

export const workspaces: Workspace[] = [
  {
    id: "personal",
    name: "Joshua's workspace",
    initials: "JW",
    plan: "Free plan",
    projects: [
      {
        id: "focus-os",
        name: "Focus OS",
        description: "A calm command center for deep work, habits, and momentum.",
        owner: "Joshua Wilson",
        updatedAt: "2026-09-05T12:30:00Z",
        updatedLabel: "Updated 2 hours ago",
        starred: true,
        published: true,
        access: "Owned by me",
        tone: "violet",
        folder: "Personal systems",
      },
      {
        id: "wealth-map",
        name: "Wealth Map",
        description: "Private net worth, investing, and long-term planning dashboard.",
        owner: "Joshua Wilson",
        updatedAt: "2026-09-04T08:15:00Z",
        updatedLabel: "Updated yesterday",
        starred: true,
        access: "Owned by me",
        tone: "amber",
        folder: "Personal systems",
      },
      {
        id: "reading-room",
        name: "Reading Room",
        description: "A focused library for ideas worth returning to.",
        owner: "Joshua Wilson",
        updatedAt: "2026-09-02T15:40:00Z",
        updatedLabel: "Updated 3 days ago",
        starred: false,
        access: "Owned by me",
        tone: "mint",
        folder: "Personal systems",
      },
      {
        id: "atlas-journal",
        name: "Atlas Journal",
        description: "Daily reflection and annual review workspace.",
        owner: "Joshua Wilson",
        updatedAt: "2026-08-28T11:00:00Z",
        updatedLabel: "Updated last week",
        starred: false,
        access: "Owned by me",
        tone: "blue",
      },
      {
        id: "studio-briefs",
        name: "Studio Briefs",
        description: "A small creative studio workspace for shipping better work.",
        owner: "Joshua Wilson",
        updatedAt: "2026-08-22T17:20:00Z",
        updatedLabel: "Updated 2 weeks ago",
        starred: false,
        access: "Owned by me",
        tone: "rose",
        published: true,
        folder: "Work",
      },
      {
        id: "morning-routine",
        name: "Morning Routine",
        description: "A minimal daily launchpad for high-value actions.",
        owner: "Joshua Wilson",
        updatedAt: "2026-08-20T07:10:00Z",
        updatedLabel: "Updated 2 weeks ago",
        starred: false,
        access: "Owned by me",
        tone: "coral",
      },
      {
        id: "accountability-room",
        name: "Accountability Room",
        description: "Shared weekly check-ins and honest progress notes.",
        owner: "Maya Adeyemi",
        updatedAt: "2026-08-19T14:10:00Z",
        updatedLabel: "Updated 2 weeks ago",
        starred: false,
        access: "Shared with me",
        tone: "slate",
      },
    ],
  },
  {
    id: "northstar",
    name: "Northstar Collective",
    initials: "NC",
    plan: "Pro plan",
    projects: [
      {
        id: "northstar-hq",
        name: "Northstar HQ",
        description: "The operating system for a small, ambitious team.",
        owner: "Joshua Wilson",
        updatedAt: "2026-09-05T10:00:00Z",
        updatedLabel: "Updated 4 hours ago",
        starred: true,
        access: "Owned by me",
        tone: "blue",
        published: true,
      },
      {
        id: "content-engine",
        name: "Content Engine",
        description: "Plan, draft, and publish useful ideas without noise.",
        owner: "Aisha Bello",
        updatedAt: "2026-09-03T13:20:00Z",
        updatedLabel: "Updated 2 days ago",
        starred: false,
        access: "Shared with me",
        tone: "coral",
        folder: "Marketing",
      },
      {
        id: "client-portal",
        name: "Client Portal",
        description: "A clear home for project updates and deliverables.",
        owner: "Joshua Wilson",
        updatedAt: "2026-08-30T09:30:00Z",
        updatedLabel: "Updated 6 days ago",
        starred: false,
        access: "Owned by me",
        tone: "mint",
        folder: "Client work",
      },
      {
        id: "team-handbook",
        name: "Team Handbook",
        description: "Principles, rituals, and ways of working.",
        owner: "Joshua Wilson",
        updatedAt: "2026-08-24T16:00:00Z",
        updatedLabel: "Updated 12 days ago",
        starred: false,
        access: "Owned by me",
        tone: "amber",
        folder: "Operations",
      },
    ],
  },
];

export function createMockProject(name: string, description: string, workspaceId: string): Project {
  const safeName = name.trim() || "Untitled project";
  return {
    id: `${workspaceId}-${Date.now()}`,
    name: safeName,
    description: description.trim() || "A new project ready for your next idea.",
    owner: "Joshua Wilson",
    updatedAt: new Date().toISOString(),
    updatedLabel: "Just now",
    starred: false,
    access: "Owned by me",
    tone: "violet",
  };
}