# Dashboard fidelity update

## Goal
Rework the existing frontend-only workspace dashboard to match the supplied light Lovable dashboard references while preserving the separate project editor and all current routes.

## What will change
- Replace the dark dashboard presentation with a light, translucent workspace shell: compact fixed sidebar, colorful blurred creation canvas, floating prompt, and white project gallery.
- Keep workspace switching, project groups, recents, account controls, search, grid/list views, sorting, starring, and project navigation functional.
- Add the documented Build/Plan selector and a richer plus menu.
- Add a frontend-only Import Project dialog with GitHub URL, ZIP upload, and local-folder entry points; no import backend will be connected.
- Add selectable project cards and a bulk-action bar with safe local/mock actions.
- Preserve loading, empty, hover, selected, disabled, and error-ready states.
- Reflow to four columns on wide screens, two on tablets, and one on mobile with a slide-out navigation drawer and no horizontal overflow.

## Technical details
- Continue using the existing TanStack routes, semantic design tokens, shadcn controls, Lucide icons, and local mock project data.
- Scope the new light/liquid-glass tokens to the dashboard so the existing project editor remains visually independent.
- Keep all creation, import, connector, and project-management behavior local/mock only.
- Verify desktop, tablet, and mobile rendering plus the key create, search, mode, import, select, and navigation interactions.
