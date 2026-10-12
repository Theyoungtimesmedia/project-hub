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
