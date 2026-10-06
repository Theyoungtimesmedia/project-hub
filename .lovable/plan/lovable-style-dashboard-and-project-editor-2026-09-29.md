# Lovable-style Dashboard and Project Editor

## Goal
Build a high-fidelity, frontend-only recreation of the supplied Lovable dashboard and editor references. The experience will use realistic local mock state, precise dark acrylic surfaces, responsive layouts, and working interactions throughout.

## What will be built
- A dashboard at `/` with a collapsible 260px workspace sidebar, centered project composer, project filtering, sorting, grid/list views, import dialog, star and overflow actions, and project cards with realistic miniature app previews.
- A project editor at `/project/$projectId` with a 48px global toolbar, collapsible chat rail, responsive preview canvas, device controls, surface switching, message actions, slash-skills picker, visual inspector mock, and direct text-edit mock.
- Editor surfaces for Preview, Code, Files, History, Cloud, AI, Agent Integrations, Connectors, Analytics, SEO, Security, Payments, Settings, and Logs.
- Dialogs and menus for workspace switching, search, attachments, imports, sharing, publishing, project actions, feedback, and settings.
- Local in-memory mock repositories and snapshots so project creation, chat turns, stars, filters, viewport changes, restore/revert, and preview updates feel functional without claiming backend persistence.
- Distinct metadata for dashboard and editor routes.

## Visual system
- Deep zinc canvas, warm coral/magenta/amber ambient lighting, translucent layered panels, hairline borders, restrained shadows, compact typography, and semantic OKLCH tokens.
- Generated raster artwork for the ambient dashboard backdrop; no SVG background artwork.
- Lucide icons and existing Radix primitives for controls, menus, dialogs, tabs, popovers, and tooltips.
- Desktop-first geometry matching the references, with tablet reflow and mobile slide-over navigation without horizontal overflow.

## Component structure
- Shared controls and visual primitives under `src/components/ui/`.
- Dashboard-specific shell, sidebar, composer, gallery, cards, and dialogs under `src/components/dashboard/`.
- Editor-specific toolbar, chat panel, composer, preview, inspector, surfaces, and dialogs under `src/components/editor/`.
- Typed mock models and local state helpers under `src/lib/`.

## Verification
- Validate the dashboard and editor at desktop and mobile widths.
- Exercise key interactions: sidebar collapse, search/filter, grid/list, star, workspace menu, project navigation, surface tabs, More menu, device switcher, chat submission, slash skills, inspector, dialogs, and restore/revert.
- Check the current build diagnostics after implementation and resolve any reported errors.
