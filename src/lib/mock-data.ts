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


// Shared editor surface identifiers; all user data is loaded from Supabase.
export type Surface = "preview" | "code" | "files" | "history" | "cloud" | "ai" | "agents" | "connectors" | "analytics" | "seo" | "security" | "payments" | "settings" | "logs";

export type SkillCommand = { command: string; title: string; detail: string; instructions?: string };

export function getAvailableSkills(skills: SkillCommand[], enabledCommands: string[], query: string): SkillCommand[] {
  const normalizedQuery = query.toLowerCase();
  return skills.filter(skill =>
    enabledCommands.includes(skill.command) &&
    (skill.command + " " + skill.title).toLowerCase().includes(normalizedQuery),
  );
}
