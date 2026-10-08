export type Project = {
  id: string;
  name: string;
  description: string;
  updated: string;
  starred: boolean;
  shared: boolean;
  live: boolean;
  tone: "coral" | "blue" | "mint" | "violet";
};

export const projects: Project[] = [
  { id: "orbit-finance", name: "Orbit Finance", description: "Personal finance command center", updated: "12 minutes ago", starred: true, shared: false, live: true, tone: "coral" },
  { id: "atelier-store", name: "Atelier Store", description: "Editorial commerce experience", updated: "2 hours ago", starred: false, shared: true, live: true, tone: "violet" },
  { id: "northstar-crm", name: "Northstar CRM", description: "Client pipeline and insights", updated: "Yesterday", starred: true, shared: false, live: false, tone: "blue" },
  { id: "signal-notes", name: "Signal Notes", description: "Focused research workspace", updated: "3 days ago", starred: false, shared: false, live: false, tone: "mint" },
  { id: "field-guide", name: "Field Guide", description: "Travel stories and city guides", updated: "6 days ago", starred: false, shared: true, live: true, tone: "blue" },
  { id: "studio-console", name: "Studio Console", description: "Operations dashboard", updated: "2 weeks ago", starred: false, shared: false, live: false, tone: "coral" },
];

export const skills = [
  { command: "/goal", title: "Goal run", detail: "Work iteratively until the objective is verified" },
  { command: "/accessibility", title: "Accessibility", detail: "Review keyboard, contrast, and screen reader support" },
  { command: "/redesign", title: "Redesign", detail: "Elevate visual design and interaction quality" },
  { command: "/seo-reviews", title: "SEO review", detail: "Audit metadata, structure, and search previews" },
  { command: "/skill-creation", title: "Skill creation", detail: "Create a reusable workspace playbook" },
  { command: "/video-creation", title: "Video creation", detail: "Produce a polished product walkthrough" },
  { command: "/release-review", title: "Release review", detail: "Review the release checklist before publication", draft: true },
];

export function getDefaultSkillCommands() {
  return skills.filter(skill => !skill.draft).map(skill => skill.command);
}

export function getAvailableSkills(enabled: string[], query: string) {
  return skills.filter(skill => enabled.includes(skill.command) && `${skill.command} ${skill.title}`.toLowerCase().includes(query.toLowerCase()));
}

export type Surface = "preview" | "code" | "files" | "history" | "cloud" | "ai" | "agents" | "connectors" | "analytics" | "seo" | "security" | "payments" | "settings" | "logs";