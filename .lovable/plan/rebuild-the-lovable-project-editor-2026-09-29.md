# Rebuild the Lovable Project Editor

## Goal
Replace the current oversized dark editor with a compact, white, frontend-only Lovable project editor that matches the supplied references and documented interactions. The dashboard is out of scope; the editor becomes the focused experience.

## What will change
- Rebuild the editor shell at `/` and `/project/$projectId` with a slim top bar, a correctly sized left chat panel, and a main workspace that expands to the full available width when chat is hidden.
- Consolidate Preview, Files, Code, and More into the top project toolbar. Active controls turn blue; clicking the active History, chat, More, or preview-toolbar control again closes that area.
- Move Desktop, Tablet, and Mobile switching into the preview navigation control instead of a separate device button row. Add a searchable page selector, refresh, and open-in-new-tab behavior there.
- Rebuild the chat composer to match the reference: clean multiline input, compact circular add-context button, mode picker, microphone, and send control without clipped edges or credit warning.
- Add a collapsible floating preview toolbar with select, inline text, draw, and comment tools; its hide control collapses it to the far-left restore arrow.
- Rework More into a full workspace with the documented left navigation and detailed project settings. Keep internal scrolling only where long More/settings/code content requires it, with hidden chrome elsewhere.
- Refine Code, Files, History, and Settings so each behaves like a dedicated editor surface rather than a generic card page.
- Use compact typography, hairline borders, white and soft-gray surfaces, precise icon buttons, stable dimensions, and no page-level scrollbar or horizontal overflow.

## Interaction checks
- Chat hide/show expands and restores the main workspace.
- Preview control switches desktop/tablet/mobile, selects pages, refreshes, and opens a new tab.
- Preview floating toolbar can activate one tool, deactivate it, collapse left, and restore.
- Preview, Files, Code, History, and More switch cleanly; active toggles close where appropriate.
- More navigation opens Settings and its General, Knowledge, Domains, and Git subsections with internal scrolling.
- Composer focus, mode menu, add-context menu, send state, dialogs, and Escape/backdrop closing work.

## Verification
- Check the editor visually at 1280px and mobile widths.
- Exercise every toggle and confirm no overlapping, clipping, page scrollbar, or horizontal overflow.
- Confirm current diagnostics are clean.
