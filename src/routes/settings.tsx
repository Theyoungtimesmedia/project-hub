import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Bell, ChevronRight, CreditCard, LockKeyhole, Palette, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Joshua's workspace" },
      { name: "description", content: "Manage your local workspace and account preferences." },
      { property: "og:title", content: "Settings — Joshua's workspace" },
      { property: "og:description", content: "Manage your local workspace and account preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const sections = [
    { icon: UserRound, title: "Profile", copy: "Your name, email, and personal details." },
    { icon: Bell, title: "Notifications", copy: "Choose which workspace updates you receive." },
    { icon: Palette, title: "Appearance", copy: "Tune the look and feel of your dashboard." },
    { icon: LockKeyhole, title: "Security", copy: "Sessions, connected accounts, and access." },
    { icon: CreditCard, title: "Plan & usage", copy: "Credits and workspace plan details." },
  ];
  return <div className="settings-page"><header className="settings-topbar"><Link to="/" className="project-back-link"><ArrowLeft className="size-4" />Back to dashboard</Link><div className="settings-topbar-label"><Settings className="size-4" />Settings</div><div /></header><main className="settings-content"><div className="settings-heading"><p className="eyebrow"><span className="eyebrow-dot" />Joshua's workspace</p><h1>Settings</h1><p>Manage your account and workspace preferences.</p></div><div className="settings-layout"><nav className="settings-nav">{sections.map((section, index) => { const Icon = section.icon; return <Button key={section.title} variant="ghost" className={index === 0 ? "settings-nav-item settings-nav-item-active" : "settings-nav-item"}><Icon /><span>{section.title}</span><ChevronRight className="ml-auto size-4" /></Button>; })}</nav><section className="settings-panel"><div className="settings-panel-heading"><div className="settings-profile-avatar">JW</div><div><h2>Profile</h2><p>How your account appears across the workspace.</p></div></div><div className="settings-field"><span>Full name</span><strong>Joshua Wilson</strong><Button variant="outline" size="sm">Edit</Button></div><div className="settings-field"><span>Email address</span><strong>joshua@example.com</strong><Button variant="outline" size="sm">Edit</Button></div><div className="settings-field"><span>Workspace</span><strong>Joshua's workspace</strong><Button variant="outline" size="sm">Manage</Button></div></section></div></main></div>;
}