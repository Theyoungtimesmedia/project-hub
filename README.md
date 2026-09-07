# Project Hub

# Context: Current implementation

I am building a private personal development platform that is intentionally modeled closely on the current Lovable.dev frontend experience.

This is FRONTEND-ONLY work for this phase.

Do not build the real backend yet.

Do not connect Lovable Cloud.

Do not connect Supabase.

Do not implement real authentication.

Do not implement real AI generation.

Do not implement real GitHub connections.

Do not implement real connectors.

Those systems will be implemented later.

For this step, build the dashboard and workspace shell using realistic local/mock state.

I have supplied reference screenshots.

The screenshots are visual references.

The official Lovable documentation supplied below is the functional/source-of-truth reference.

The Gemini research supplied below is secondary research that organizes and interprets the official documentation.

# SOURCE AUTHORITY

Use this priority order:

1. Official Lovable documentation pasted below

2. My uploaded screenshots

3. Gemini research pasted below

4. Your existing implementation knowledge

The official Lovable documentation is the BIBLE for this task.

Treat it as authoritative.

Do not override it with assumptions.

If the Gemini research conflicts with the official documentation, follow the official documentation.

If my screenshot conflicts with a guessed design detail in the Gemini research, follow the screenshot.

Do not invent undocumented Lovable behavior.

# Objective

Build Package A of the frontend:

DASHBOARD + WORKSPACE SHELL.

The finished dashboard should feel like a real, polished Lovable-style development platform rather than a generic SaaS dashboard.

It must be responsive on:

- desktop

- tablet

- mobile

The experience should feel coherent at every breakpoint.

# Scope

Implement:

- main dashboard

- workspace selector

- sidebar

- sidebar collapse/expand

- home/dashboard navigation

- projects navigation

- project groups

- all projects

- starred projects

- created by me

- shared with me

- folders

- recent projects

- project cards

- project thumbnails

- project metadata

- project search

- search/filter UI

- sorting UI

- grid/list view

- create project flow

- prompt input area

- plus/add menu

- workspace switcher

- account menu

- settings entry point

- connector entry point

- notification/inbox entry point

- what's-new entry point

- upgrade/usage area where applicable

- realistic loading states

- realistic empty states

- realistic hover states

- realistic selected states

- realistic disabled states

- realistic error states

Do not build the actual backend functionality.

Use a frontend data/service abstraction so the UI can later be connected to Supabase without rewriting the presentation layer.

# Visual direction

Match the supplied Lovable screenshots closely.

Pay attention to:

- proportions

- spacing

- typography hierarchy

- border radius

- panel density

- sidebar width

- icon sizing

- text hierarchy

- hover behavior

- active navigation states

- muted text

- surface contrast

- modal proportions

- card proportions

- responsive collapse behavior

Do NOT produce a generic dashboard.

Do NOT add unnecessary gradients.

Do NOT add random glassmorphism.

Do NOT use purple just because the product is an AI tool.

Do NOT replace the reference design with your own "modern SaaS" interpretation.

The objective is fidelity to the supplied reference.

# Interaction requirements

The interface must actually behave like a working product.

Examples:

- sidebar collapses and expands

- workspace selector opens

- workspace switching updates visible workspace/project data

- project filters work locally

- search filters projects

- grid/list view works

- starred state can change

- folders can expand/collapse

- create project opens a real modal/sheet

- create project adds a realistic mock project

- project cards navigate to the project route

- account menu opens

- settings entry navigates to its frontend route

- notifications panel opens

- command/search interface opens

- mobile navigation uses an appropriate mobile pattern

Do not create dead buttons when a reasonable frontend interaction can be implemented without backend functionality.

# Responsive requirements

Desktop:

Maintain a dense professional workspace layout.

Tablet:

Preserve navigation and content hierarchy without causing horizontal overflow.

Mobile:

Do not simply shrink the desktop dashboard.

Create an intentional mobile experience.

Use mobile navigation patterns where appropriate.

The project list, search, create-project flow, workspace selector, and account controls must all remain usable.

No horizontal overflow.

No clipped dialogs.

No overlapping navigation.

No unusable icon-only controls unless their meaning is obvious and an accessibility label exists.

# Architecture

Before changing code:

1. Inspect the existing project structure.

2. Identify existing routing.

3. Identify the current component system.

4. Identify existing styles/tokens.

5. Reuse existing components where they make sense.

6. Do not create duplicate versions of components that already exist.

7. Preserve working code.

Create reusable components for repeated UI patterns.

Examples:

- AppShell

- Sidebar

- WorkspaceSwitcher

- ProjectCard

- ProjectGrid

- ProjectList

- SearchCommand

- CreateProjectDialog

- UserMenu

- NotificationPanel

- EmptyState

- LoadingState

Do not create these exact names if the existing architecture already has equivalent components.

Adapt to the existing architecture.

# Data model for this phase

Use mock/local data.

Create a clear separation between:

UI components

→ local/mock service layer

→ future backend interface

The frontend should not become dependent on Supabase during this step.

# Regression guardrails

RETAIN:

- existing working routes

- existing build configuration

- existing dependencies

- existing design system where useful

- existing application entry points

- existing working functionality

DO NOT:

- migrate backend

- install unnecessary packages

- rewrite the entire application

- create a second routing system

- duplicate existing components

- delete existing working features

- add a real authentication system

- add Supabase

- add Lovable Cloud

- add real connectors

- add real AI APIs

- add fake backend promises

# Agentic execution rules

Do not immediately start changing files blindly.

First inspect the current project.

Then determine the smallest coherent implementation required for Package A.

Implement only Package A.

After implementation, inspect the affected routes/components for obvious regressions.

Do not continue into Package B-F.

Do not redesign unrelated screens.

Do not add speculative features outside this scope.

# Definition of done

Package A is complete when:

- dashboard works

- workspace switching UI works

- project navigation works

- project search works

- filtering works

- grid/list works

- create-project UI works

- project cards navigate correctly

- sidebar behaves correctly

- account and notification surfaces open correctly

- responsive behavior works across desktop/tablet/mobile

- no obvious layout breakage exists

- no duplicated architecture was introduced

- no backend dependency was introduced

# OFFICIAL LOVABLE DOCUMENTATION — PRIMARY SOURCE

Paste the relevant official documentation here:

<<< LOVABLE DOCUMENTATION A IS in the uploaded file named Prompt A Documentation.txt

# GEMINI RESEARCH — SECONDARY SOURCE

Paste ONLY Package A research here:

<<< GEMINI RESEARCH A START >>>

Architecture and UX Reverse-Engineering Report for Lovable.dev

A — Dashboard & Workspace

Research Narrative & Architectural Analysis

A1. Product Behavior

The Lovable dashboard serves as the central application shell and project launchpad. Upon initial access, the user is presented with a persistent navigation sidebar on the left and a central workspace canvas featuring a high-prominence prompt composer at the top, followed by a filterable, multi-view project directory.

<<< GEMINI RESEARCH A END >>>

# VISUAL REFERENCES

Use the supplied screenshots as the visual authority.

[SCREENSHOTS ATTACHED TO THIS PROMPT]

# FINAL INSTRUCTION

Build only Package A.

Do not build Package B, C, D, E, or F yet.

Inspect first.

Implement deliberately.

Preserve existing architecture.

Prioritize visual fidelity, responsive behavior, interaction quality, and clean reusable frontend structure.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/453ebde8-1ded-4217-8a5c-0dc46ad843df).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
