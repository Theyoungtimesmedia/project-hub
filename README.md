# Build Studio

i want u to code for me to build a lovable.dev clone front end only the first image is the dashboard the second image is the project editor now hered some information about both the UI/UX of both the dashboard and the project editor use specifics use the images and text description below focus on the details and specific locations of the UI  use the upload file 1 as a prompt it was intended for claude but u can use it and uploaded file 2 is the design stuff specific UI location uploaded file 3 is an image file its the Lovable.dev dashboard file 4 is the project editor ignore the thing in the preview Here is the exact, unvarnished breakdown of what real Lovable looks and feels like across both the Dashboard and the Project Editor, why the current app looks messy and dissonant, and how we will clone the authentic experience.

generate images and icon use the righ specing donot use svgs for the background create an image copy the UI/UX perfectly design and accuracy first  # TASK SPECIFICATION: High-Fidelity Frontend Clone of Lovable.dev (Dashboard & Project Editor)

## Role & Engineering Persona
You are a Principal Frontend Architect and Design Engineer with obsessive attention to UI fidelity, micro-interactions, and modern design systems. You build clean, production-grade, meticulously organized frontend code. 
Your aesthetic is "Minimalist Billionaire": ultra-clean, pragmatic, restrained, high-end, dark-mode first, with hairline borders, precise optical spacing, and zero generic purple neon bloat.

## Tech Stack Requirements
- **Framework:** React 19 + TypeScript (Strict mode enabled, no `any`)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (v4 semantic tokens) or native CSS modules with OKLCH / HSL semantic variables
- **Icons:** `lucide-react`
- **Primitives:** Radix UI (`@radix-ui/react-dropdown-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, `@radix-ui/react-tabs`, `@radix-ui/react-popover`)
- **State Management:** Reactive local state / Context / Zustand with mock repositories (UI -> Mock Service Layer ready for future backend binding without rewriting the presentation layer)

---

## 1. Visual Design Tokens & Surfaces

### Palette & Tokens
- **Canvas Base Background:** `#09090b` (Deep Zinc / Slate 950)
- **Layer 1 Surface (Sidebars, Topbars, Modals):** `rgba(18, 18, 22, 0.75)` with `backdrop-filter: blur(16px)`
- **Layer 2 Surface (Cards, Hover states, Panels):** `rgba(28, 28, 34, 0.65)` with `backdrop-filter: blur(20px)`
- **Border Stroke (Hairline):** `rgba(255, 255, 255, 0.08)` (Active / Focus: `rgba(255, 255, 255, 0.20)`)
- **Text Primary:** `#F4F4F5` (Zinc 100)
- **Text Secondary:** `#A1A1AA` (Zinc 400)
- **Text Muted / Micro-labels:** `#71717A` (Zinc 500)
- **Accent Glow / Tint:** Ultra-subtle coral / magenta / amber radial warmth (`rgba(244, 63, 94, 0.06)` blending into pure darkness), never blinding neon.
- **Typography:** Modern clean sans-serif with tight tracking (`tracking-tight` on headings, `text-xs font-mono` on file paths and badges).

---

## 2. Screen A: The Workspace & Dashboard

### Layout Geometry
- **Left Collapsible Sidebar:** Fixed width `260px` (collapses to `60px` icon rail via `[` or `Cmd+B`).
- **Main Launchpad Canvas:** Flex-1, centered hero launcher, project gallery grid beneath it.

### Sidebar Structure (Top to Bottom)
1. **Workspace Switcher Pill (Top):**
   - Shows current Workspace Name (e.g., "Personal Workspace") + Workspace Avatar + Chevron (`▾`).
   - Clicking opens a popover listing user workspaces, "+ Create Workspace", and "Workspace Settings".
2. **Global Navigation Items:**
   - **Dashboard** (Home icon, highlighted active indicator)
   - **Search** (Magnifying glass, shortcut badge `⌘K` that opens command palette)
   - **Connectors / Integrations** (Plug / Zap icon, badge showing connected tools)
3. **Project Filters & Navigation:**
   - **All Projects** (Folder icon, count badge)
   - **Starred** (Star icon, count badge)
   - **Owned by me** (User icon)
   - **Shared with me** (Users icon)
4. **Recent Projects List:**
   - Section header: `RECENTS` (small mono uppercase).
   - Quick list of the last 5–7 accessed projects with tiny favicon/tone dots.
5. **Footer Section (Bottom pinned):**
   - **Usage / Tier Card:** Clean progress meter (e.g., "5/5 daily build credits remaining", "Pro Plan").
   - **User Profile Row:** User avatar, name, email, quick settings icon, and sign-out trigger.

### Central Launchpad & Composer
1. **Hero Header:**
   - Clean, crisp typography: *"What do you want to build?"* with subtle ambient glow behind the composer.
2. **The Floating Prompt Composer:**
   - Large auto-expanding textarea (`min-h-[120px]`) with smooth focus ring.
   - **Bottom Left Triggers (Inside the box):**
     - **`+` Attach Menu:** Opens dropdown for Image/Mockup upload, CSV/Data, Template presets, and Connectors.
     - **Mode Switcher Pill:** Persistent toggle between **Build Mode** (hammer icon, default) and **Plan Mode** (blueprint icon).
   - **Bottom Right Triggers:**
     - Microphone icon (voice dictation mock).
     - **Send Button (`↑`):** High-contrast circular pill; active state illuminates when text is typed; keyboard shortcut `↵ Enter` (Shift+Enter for newline).

### Project Gallery & Management
1. **Gallery Toolbar:**
   - Tabs: *All Projects*, *Created by me*, *Shared with me*.
   - Filter input for live inline search.
   - Sort dropdown (*Last modified*, *Alphabetical*, *Created date*).
   - **Grid vs List Toggle:** Icon buttons for visual thumbnail cards vs dense tabular rows.
   - **Import Project Button:** Secondary button triggering a modal with GitHub repo URL, ZIP upload, and local folder tabs.
2. **Project Card Anatomy (Grid View):**
   - **Mockup Canvas (Top):** Browser chrome bar (3 dots/traffic lights) + realistic mini UI preview thumbnail.
   - **Status Badges:** `● Live` indicator (if published) and framework pill (`React + Vite`).
   - **Metadata Row:** Project name (bold), relative timestamp ("Edited 2 hours ago"), collaborator avatars.
   - **Hover Action Toolbar:** Star toggle (`★`), Share button, and 3-dots overflow menu (`...` with *Open in new tab, View published, Rename, Duplicate, Project Settings, Delete*).
   - **Multi-select Checkbox:** Appears on hover or Shift-select; triggers a floating bottom bulk-action bar (*Move, Duplicate, Delete*).

---

## 3. Screen B: The Project Editor

### Top Global Navigation Bar (`h-12`, Sticky)
- **Left:**
  - Chevron back to dashboard (`←`).
  - Project Title Pill (editable in-place with pencil hover).
  - Branch tag (`main` with Git branch icon).
  - Credit status pill (`45/50 credits`).
- **Center:**
  - Viewport Switcher: **Desktop** (100%), **Tablet** (820px letterboxed), **Mobile** (390px phone bezel).
- **Right:**
  - GitHub Sync Status badge (`Synced` with GitHub icon).
  - **Share** button (opens modal for link sharing / permissions).
  - **Publish** button (primary high-contrast button; opens deploy drawer with `project.lovable.app` domain settings).
  - User avatar dropdown.

### Split-Screen Geometry
- **Left Rail (Chat & Agent Panel):** Width `420px` (collapsible to a `40px` strip via `[`).
- **Right Rail (Preview Canvas & Surfaces):** Flex-1 canvas.

### The Left Chat / Agent Panel
1. **Panel Header:**
   - Active mode pill: **Build** / **Plan** / **Ask**.
   - Clear chat / New session icon (`+`).
   - Collapse panel icon (`[`).
2. **Message Turn Anatomy:**
   - **User Prompt Bubble:** User text with attached screenshot thumbnail pills.
   - **Thinking Accordion:** Shimmering animated pill during generation (`Thinking... 4s`); collapses into `Finished thinking` (`v`) displaying internal step-by-step reasoning when clicked.
   - **Tool Call Execution Badges:** Compact monospace pills:
     - `Read src/components/Header.tsx`
     - `Created src/components/Hero.tsx`
     - `Updated src/styles.css`
     (Clicking any pill opens a side-by-side or modal diff view).
   - **Turn Completion Summary:** Clean markdown text explaining what was built or changed.
   - **Bottom Message Action Toolbar (Strict 5-button sequence):**
     1. `↺` **Revert / Rollback:** Reverts preview and mock state to this checkpoint.
     2. `❐` **Copy:** Copies turn notes to clipboard.
     3. `👍` **Thumbs Up:** Positive feedback.
     4. `👎` **Thumbs Down:** Opens issue reporting dialog.
     5. `...` **Overflow Menu:** Opens floating menu with:
        - *View Git Diff*
        - *View Raw Prompt & Token Logs*
        - *View Sandbox Terminal Output*
        - *Retry Turn*
        - *Share Turn*
3. **Bottom Floating Composer:**
   - **Attachment Triggers:**
     - `📎` File / Asset upload
     - `✂️` Preview screenshot crop tool
     - `@` Context tagger (tag specific components/files)
     - `🎙` Voice input
   - **Slash (`/`) Skills Menu:** Typing `/` opens a floating autocomplete menu with pre-built skills:
     - `/seo` — Generate meta tags and robots.txt
     - `/auth` — Configure authentication guards
     - `/db` — Setup database schema and tables
     - `/audit` — Check accessibility and contrast
   - **Input Field:** Expandable textarea.
   - **Action Bar:** Mode pill selector (`Build ▾`) + Send arrow button (`↑` / `■` stop during build).

### The Right Canvas & Surfaces
1. **Surface Switcher Bar (Top of canvas):**
   - **Preview** (Live responsive iframe/view of the app)
   - **Code** (Monaco / syntax-highlighted code editor with file breadcrumb and diff toggle)
   - **Files** (Full directory file tree with *New File*, *New Folder*, *Upload Asset*)
   - **History** (Vertical checkpoint timeline with single-click restore)
   - **Database** (Visual table viewer and schema designer)
   - **Logs** (Console and network runtime output drawer)
2. **Floating Visual Edit Tools (Overlaying the Preview Canvas):**
   - **Element Inspector (`🎯` crosshair icon):** Clicking activates inspect mode. Hovering highlights components with blue bounding box and tag badge (`<div>`, `<button>`). Clicking pins the component reference into the chat composer (`Selected: <button.primary>`).
   - **Direct Text Edit Tool (`T` icon):** Double-clicking preview text makes it editable inline with Save / Discard floating pills.

---

## 4. Engineering & Execution Standards
1. **Responsive Behavior:** Dense layout on desktop (≥1280px); smooth 2-column reflow on tablet (768px–1024px); slide-out sheet navigation on mobile (<768px). **Never allow horizontal scrolling.**
2. **Interaction Integrity:** No dead buttons. Every tab switches views; cards navigate; stars toggle; filters reduce the list; search responds immediately; modals open and close via `ESC` or backdrop click.
3. **Code Quality:** Split into clean modular components (`src/components/dashboard/`, `src/components/editor/`, `src/components/ui/`).
4. **Self-Verification Step:** Double-check all font weights, hairline borders, backdrop blur layers, and responsive breakpoints before finishing. Ensure every coordinate and icon matches real Lovable.dev aesthetics.---

Part 1: How the Real Lovable Dashboard Actually Looks & Works

1. Color Palette, Materials & Atmosphere
* Background: Deep dark canvas with warm-neutral depth (`#09090b` / deep zinc), never flat pure black and never washed-out grey.
* Ambient Glow: In the upper center behind the hero composer, there is an ultra-subtle ambient conic/radial glow—subtle shades of coral/magenta/amber light fading smoothly into darkness.
* Surface Layering: 
  * Cards and panels have hairline border strokes: `rgba(255, 255, 255, 0.08)`.
  * Backgrounds use semi-translucent dark fills with subtle backdrop blurs (`rgba(20, 20, 24, 0.6)` / `backdrop-blur-md`).
  * No muddy colors, no blinding neon gradients, and no random box shadows.

2. The Collapsible Sidebar
* Header / Workspace Picker: Clean dropdown pill showing the current workspace name, avatar icon, and a chevron. Clicking opens a menu to switch workspaces, manage workspace settings, or invite team members.
* Top Navigation:
  * Dashboard / Home (active indicator)
  * Search (⌘K) — triggers quick jump command palette
  * Connectors / Integrations
* Project Categorization:
  * All Projects (with total count badge)
  * Starred (with count)
  * My Projects / Shared with me
* Recent Projects List: Direct links to the last 5–7 accessed projects with small favicons or indicators.
* Bottom Section:
  * Clean Upgrade / Credits bar (e.g. "5/5 daily credits" or "Pro Plan").
  * User Profile & Settings: Clean avatar, name, email, quick settings trigger, and dark mode toggle.

3. The Hero Launchpad (The Centerpiece)
 Title: Bold, crisp typography: "What do you want to build?" or "Build anything with natural language"*.
* Floating Prompt Composer:
  * Large, generous textarea with silky-smooth focus ring.
  * Bottom Bar inside Composer:
    * Left: Plus button (`+`) for attachments (images/mockups, CSV/data, design files), template picker, connectors, database options.
    * Mode Switcher: Toggle between Build (executes changes directly) and Plan (explores, architectures, reviews first).
    * Right: Audio/Dictation mic icon + Send action button (bright active state when text is entered, keyboard shortcut `↵ Enter`).

4. Project Gallery & Management
* Filter & View Bar:
   Tabs: All projects, Created by me, Shared with me*.
  * Search filter input with live typing.
   Sort dropdown (Last modified, Alphabetical, Recently created*).
  * Grid / List switcher (toggle between visual thumbnail cards and dense tabular rows).
* Project Cards:
  * Visual Canvas / Mockup Thumbnail: Realistic browser chrome top bar (traffic lights or URL pill) showing an actual miniature UI preview, not random color blocks.
  * Status Pills: Live deployment badge (`● Live` / `Published`), framework tag, Git sync status icon.
   Metadata: Project title, relative timestamp ("Edited 2 hours ago"*), collaborator avatars.
   Actions on Hover: Star toggle, 3-dot context menu (Open in new tab, View published, Rename, Duplicate, Project Settings, Delete*).
  * Multi-select: Select boxes appear on hover or Shift-click to batch delete/move.

---

Part 2: How the Real Lovable Project Editor Actually Looks & Works

1. The Global Editor Top Navigation Bar
 Left: Back to dashboard chevron, project name (inline editable), workspace crumb, and live saved status indicator ("Saved"*).
* Center:
  * Device Viewport Toggle: Desktop (1280px), Tablet (768px), Mobile (390px) responsive frame controls.
  * Surface Mode Tabs: Preview (live app preview) vs Code (interactive editor / code viewer with syntax highlighting) vs Database / Integrations.
* Right: 
  * History / Versions button.
  * GitHub push status.
  * Share link button.
  * Prominent Publish / Deploy button.

2. The Split-Screen Layout
* Left Rail: The AI Conversation & Collaboration Panel (width ~400px–460px):
  * Mode Badge: Current active mode indicator (Build / Plan / Ask).
  * Chat Feed: Chat history showing user prompts and Lovable's agentic actions:
     Collapsible file modification cards ("Edited src/App.tsx", "Created components/Hero.tsx"*).
    * Terminal/command execution badges.
    * Real-time step progress spinner / checklist.
  * Bottom Floating Input Bar:
    * Multi-line expandable input.
    * Mention system (`@component`, `@file`).
    * Attach screenshot/mockup button.
     Quick suggestion pills ("Add dark mode", "Connect database", "Make it responsive"*).

* Right Rail: The Live Preview Canvas & Visual Inspector:
  * Simulated browser frame with clean navigation bar: URL display, refresh button, responsive dimensions display, open in new tab pop-out.
  * Interactive Preview: The actual live web application rendering inside a clean viewport with realistic components.
  * Visual Select / Inspector Mode: Cursor tool that lets you click any element on the preview to select it and prompt modifications directly against that specific UI node.

---

Part 3: What We Will Fix to Eliminate the Mess

1. Purge the mismatched tokens: Throw out the harsh flat blacks, weird bright blues, and inconsistent fonts. Align CSS variables to zinc-950/900/800 base tones, crisp borders (`border-white/10`), and pure white text hierarchy.
2. Restore Lovable's exact layout proportions: Clean, airy 260px sidebar, perfectly centered hero launchpad, and high-fidelity project preview cards.
3. Make every button and interaction live (frontend mock state):
   * Workspace switcher toggles real workspace data.
   * Search filter filters projects in real time.
   * Star toggles pin items to the "Starred" tab immediately.
   * Creating a project immediately creates a new project card and navigates into the editor.
   * View switcher toggles between rich grid cards and clean table list view.
   * In the editor: toggle between Desktop/Tablet/Mobile viewports, switch between Preview and Code view, and chat prompts generate realistic agent steps and update the preview.

When you're ready to proceed, say the word or ask to implement it, and we can switch to Build mode to build the complete, high-fidelity Lovable dashboard and editor.Here is the complete, uncompromising architectural and UI/UX blueprint of the real Lovable Project Editor. Every button, panel, coordinate, floating tool, and menu is detailed below with absolute precision. No sugarcoating, no generic SaaS guesses, and no hand-waving.

---

1. The Global Top Navigation Bar
Height: ~48px–52px. Sticky across the entire browser viewport.

* Left Section:
  * Workspace / Dashboard back button: A subtle chevron/arrow icon or Lovable heart/flame glyph leading back to the dashboard (`/`).
  * Project Name Pill: Text input / clickable dropdown showing the project slug (e.g., `gadget360-lagos-vibes-38`). Hovering shows a pencil edit icon; clicking lets you rename in-place.
  * Branch / Version Tag: Adjacent pill indicating the active branch or checkpoint state (e.g., `main` with a git branch icon, or a dot indicator showing status).
  * Credit / Usage Meter: A compact counter or progress bar showing remaining credits (e.g., `45 / 50 daily` or active workspace pool).

* Center Section:
  * Surface / Mode Viewport Switcher: (See Section 3 below for the exact surface tabs).

* Right Section:
  * GitHub Sync Status: A GitHub cat icon showing repository sync status (`Synced`, `Syncing`, or `Connect to GitHub` button).
  * Share Button: Outlined button (`Share` with user-plus icon). Opens project visibility modal (Private / Workspace / Public link, collaborator emails, and roles).
  * Publish Button: High-priority primary button (`Publish` with cloud/upload icon, or `Update` if already deployed). Opens deploy drawer showing custom domain settings, subdomain slug (`yourapp.lovable.app`), and build deployment status.
  * User Profile Avatar / Workspace Settings: User circle with dropdown for account settings, project settings, keyboard shortcuts (`?`), and logout.

---

2. The Chat / Agent Rail (Left Panel)
Width: 380px–460px (resizable via divider grab-handle; collapsible).

A. The Chat Header
* Sits just under the global top bar.
* Displays the current session title or prompt turn tracker.
* Includes a New Chat / Clear Session icon button (plus/compose) and a Collapse Chat toggle icon (`[`) to tuck the chat panel into a narrow 40px icon rail for full-width preview inspection.

B. The Build Message Turn Anatomy
Every agent response turn has a strict 4-part visual hierarchy:

1. User Prompt Bubble:
   * Clean right-aligned or full-width user prompt card with attached media thumbnail pills (if screenshots or mockups were uploaded).
   * Hover actions on user message: Edit prompt (pencil icon to branch or retry) and Copy prompt (clipboard icon).

2. The "Thinking" Accordion Block:
   * While generating: An animated shimmering pill with a brain or sparkle icon reading `Thinking...` with duration elapsed.
   * On completion: Collapses into an understated row: `Finished thinking` with an expand chevron (`v`).
   * Clicking it expands the internal chain-of-thought monologue (reasoning trace, planning steps, code architecture strategy).

3. Tool Call Badges & Progress Log:
   * Under thinking, agent file-system actions appear as compact inline pills:
     * `Read src/components/Header.tsx`
     * `Created src/components/ProductGrid.tsx`
     * `Modified src/styles.css`
   * Clicking any pill opens a side-by-side or inline code diff for that specific edit.

4. The Turn Summary & Completion Card:
   * Clean markdown text explaining what was built, fixed, or updated.
   * If dependencies were installed or errors resolved, a highlighted summary callout appears.

5. The Bottom Message Action Toolbar (Your Test Question!):
   * Placed right at the footer of each completed build response:
     1. Revert / Rollback to this version (`↺` counter-clockwise arrow): Single-click rollback that resets the entire codebase, file tree, and preview iframe back to the exact Git commit checkpoint made at the end of this turn.
     2. Copy (`❐` double-square clipboard icon): Copies the markdown summary and change notes to your system clipboard.
     3. Thumbs Up (`👍`): Sends positive feedback on code quality/styling to the model evaluation pipeline.
     4. Thumbs Down (`👎`): Opens a friction dialogue with preset tags ("Broke layout", "Ignored prompt", "Runtime error", "Incomplete") plus optional feedback text.
     5. Three Horizontal Dots (`...`) — The Overflow Menu:
        * Clicking this opens a floating context dropdown containing:
          * View Git Diff / Changes: Opens the file-by-file added/removed line viewer comparing this turn against the prior turn.
          * View Raw Prompt / Full Context: Inspects the raw instructions, injected system instructions, and token consumption count for this turn.
          * View Build Logs & Terminal Output: Shows the sandbox bundler logs (Vite output, npm installs, TypeScript checks).
          * Retry turn / Re-run prompt: Re-submits the exact prompt turn with fresh generation parameters.
          * Share turn / Copy link to message: Deep-links to this exact message in the conversation.
          * Report generation issue: Flags inappropriate or broken output.

C. The Mode Selector (Always Visible)
* Unlike older designs that bury modes, Build, Plan, and Chat/Ask are persistent, high-visibility toggles:
  * Build Mode (Hammer / Sparkle icon): Default. Full code-editing authority. The agent reads, plans, writes files, installs packages, and compiles the live preview.
  * Plan Mode (Blueprint / List-checks icon): Code edits are completely blocked. The agent writes technical specifications, architectural breakdowns, and plans to `.lovable/plan.md` for your review before touching any code.
  * Chat / Ask Mode (Message-circle icon): Read-only mode. Use it to ask questions about the current codebase, trace bugs, or explore ideas without consuming high-power build pipeline credits or touching files.

D. The Composer Bar (Bottom)
* Direct Attachment Triggers (No monolithic `+` gate):
  * Attach Files / Media (`📎` paperclip): Direct file-picker dialog for images, SVG logos, data JSONs, or specifications.
  * Capture Preview Screenshot (`✂️` or camera crop icon): Activates a crosshair over the live preview iframe. You drag a bounding box over any broken element or styling flaw, and it snaps a cropped PNG right into the prompt box as visual context.
  * Add Project Context (`@` or `#` context button): Opens a searchable menu to tag specific files (e.g. `@src/components/Navbar.tsx`) or database tables so the model focuses only on those files.
  * Dictation / Microphone (`🎙` mic icon): Real-time voice-to-text recording directly into the composer.
* Textarea: Auto-expanding field with placeholder `Ask Lovable to edit this page, add a feature...`.
* Action Row:
  * Left: Fast Response / Model toggle and token badge.
  * Right: Dedicated Mode Pill (`Build ▾`) + Circular Send Button (`↑` arrow, highlighted when text or attachments are present; changes to a stop square `■` during generation).

---

3. The Surface Switcher (Chat / Preview Divider Bar)
Positioned in the header right at the dividing boundary between the chat rail and the main canvas.

* Preview Tab (Eye / Monitor icon): Active by default. Displays the live running preview application.
* Code Tab (Code brackets `</>` icon):
  * Switches or splits the canvas into a full Monaco editor.
  * Top of Code view shows file path breadcrumb, file tabs, line numbers, syntax highlighting, and a Diff Toggle button to switch between current code and previous commit.
* Files Tab (Folder icon):
  * Opens the collapsible project directory tree (`src/`, `public/`, `components/`, `lib/`).
  * Action icons at the top of the file tree: New File, New Folder, Upload Asset, and Search Files.
* History / Versions Tab (Clock with rewind arrow icon):
  * Opens a vertical timeline of every prompt turn, auto-commit, and manual rollback checkpoint.
  * Shows timestamps, prompt summaries, and single-click "Restore version" triggers.
* Console / Logs Tab (Terminal icon):
  * Opens a bottom drawer showing sandbox server logs, runtime browser errors, and network request traces.

---

4. The Live Preview Canvas & Control Toolbar
Fills the right 60–75% of the screen.

A. The Top Browser Chrome Toolbar
* Left:
  * Back (`<`) and Forward (`>`) arrows: Controls navigation history within the preview iframe.
  * Reload (`↻` circular arrow): Force-reloads the preview frame.
  * Route Selector / Address Pill: Shows the current route (e.g. `Homepage /`, `/shop`, `/details`). Clicking it drops down a quick list of all pages defined in the router, so you can jump between routes without finding links on the page.
  * Pop-Out Icon (`↗` external link): Opens the live app in a clean browser tab without editor frames.
* Center — Device Viewport Switcher:
  * Desktop Monitor Icon: 100% responsive fluid width.
  * Tablet Icon: Centers an 820px viewport frame with dark letterbox bars and rounded device corners.
  * Mobile Smartphone Icon: Centers a 390px iPhone-ratio viewport frame with device bezels.
* Right:
  * Scale / Zoom Dropdown: 100%, 75%, 50%, or "Fit to Screen".
  * Console / Error Badge: Shows `0 errors` (or a red badge e.g. `1 error` if a runtime issue occurs; clicking expands the stack trace).

---

5. The Floating Visual / Design Edit Tool (Over the Preview)
Floating directly on top of the preview canvas (docked at top-center or floating as a pill).

This is one of the most critical Lovable tools:

1. The Visual Element Inspector (`🎯` crosshair / cursor toggle):
   * When toggled ON, the preview enters "Inspect Mode":
   * Hovering over any element in the iframe highlights it with a blue bounding box and an HTML tag badge (e.g. `<div>`, `<button>`, `<h1>`).
   * Clicking an element freezes the selection, draws corner resize handles, and automatically injects that element’s component name and DOM path into the chat composer as a pinned reference pill (e.g., `Selected: HeroSection.tsx > <button.cta>`).
    You can immediately type "make this button black with rounded-full padding"* without explaining which button you mean.

2. The Direct Text / Content Edit Tool (`T` text icon or inline pencil):
   * Double-clicking any text block inside the preview turns that text into an editable inline content box.
   * You type your copy changes directly on the screen.
   * A small floating bar appears above the edit: Save Changes (green check) or Discard (cross).
   * Clicking Save bypasses the long AI pipeline and immediately updates the text string in the matching source file.

3. Floating Context Menu (Right beside selected element):
   * Prompt about this element: Opens a quick floating mini-input right above the component.
   * Inspect in Code: Flips the surface to the Code tab with the exact component file and line number highlighted.
   * Delete element: Prompts the agent to cleanly remove that component.

---

6. Honest Reality Check: What Must Be Frontend Mock vs What Requires a Cloud Backend

To ensure complete clarity and avoid false assumptions:
1. The Iframe & Element Inspector:
   * In a pure frontend clone without an isolated backend sandbox, the preview iframe renders our internal router components, and the inspector uses a `postMessage` event bridge between the parent window and the iframe to highlight DOM nodes.
2. The Code & Files Surface:
   * In local state, we feed the file tree from our mock project repository, rendering real syntax-highlighted code panels and file creation dialogues.
3. Rollback & Revert:
   * In local state, every prompt submission saves a snapshot to an in-memory or localStorage commit history stack. Clicking the Revert button (`↺`) re-hydrates that exact snapshot state.
4. Build Summaries & Thinking Accordion:
   * When you submit a prompt, the mock engine displays the realistic `Thinking...` state, streams synthetic file operation badges (`Read...`, `Modified...`), collapses to `Finished thinking`, and appends the action toolbar with working revert, copy, feedback, and overflow menus.

This is the exact, comprehensive architecture of the Lovable Project Editor. If you want this implemented, let me know and we can switch to Build mode to build the complete, high-fidelity editor.Here is the complete, meticulous architectural breakdown of the "More" Surface Pages and the Slash (`/`) Skills System in the Lovable Project Editor.

Every coordinate, button location, sub-page layout, and pre-built workflow is documented below with zero guesswork.

---

Part 1: The "More ▾" Menu & Toolbar Geometry

1. Where the "More" Menu Lives
* Location: In the project editor's top canvas toolbar (the horizontal bar directly above the live preview canvas, dividing the chat rail from the preview).
* Relative Position: To the right of the primary surface tabs:
  `[ Preview 👁 ]` | `[ Code </> ]` | `[ | separator ]` | `[ More ▾ ]`
* Trigger Styling: A compact, rounded button (`h-8 px-2.5`, subtle hairline border `border-white/10`, muted text `text-zinc-400 hover:text-white`). A subtle chevron down (`▾`) sits to the right of the word "More".
* Click Behavior: Clicking opens a floating dropdown menu anchored to the bottom-left of the button. The dropdown has an acrylic dark surface (`bg-zinc-950/95`, `backdrop-blur-xl`, `border border-white/10`, `shadow-2xl`, rounded-xl `w-64 p-1.5`).

2. The Complete List of Pages in the "More" Dropdown
Inside the dropdown, items are grouped into three distinct vertical sections with hairline dividers:

1. Infrastructure & Backend:
    Cloud (Icon: Cloud/Database)* — Database tables, user auth, storage, edge functions, cron jobs, logs, and secrets.
    AI (Icon: Sparkles/Brain)* — AI Gateway usage, model tokens, latency, and spend monitoring.
    Agent Integrations (Icon: Bot/Network)* — MCP (Model Context Protocol) server publishing to connect Claude, ChatGPT, or Cursor to the app.
    Connectors (Icon: PlugZap)* — Third-party service bindings (Slack, Linear, GitHub, Stripe, Supabase).
2. Growth, Insights & Security:
    Analytics (Icon: BarChart3)* — Live visitor traffic, pageviews, referrers, and device breakdowns.
    SEO & AI Search (Icon: Globe/Search)* — Search engine optimization audit, AEO (AI engine) crawler simulations, Semrush data.
    Security (Icon: ShieldCheck)* — Vulnerability scanner, dependency alerts, and one-click agent remediation.
    Sensitive Data (Icon: EyeOff/Lock)* — PII compliance scanner (visible when sensitive data detection is enabled).
3. Commerce & Project Configuration:
    Payments (Icon: CreditCard)* — Stripe and Paddle checkout setups, product tiers, and webhook listeners.
    Settings (Icon: Settings/Sliders)* — General metadata, Knowledge/Memory rules, Custom Domains, and Git sync.

Selecting any item flips the main right-hand canvas from the Live Preview to that specific full-bleed tool surface, displaying a top sub-bar with a `← Back to Preview` button so you never lose your context.

---

Part 2: Sub-Pages Under "More" — Exact UI/UX & Button Locations

1. Cloud (Lovable Cloud / Backend)
The complete embedded backend dashboard.
* Top Header Bar:
  * Left: Instance Health Badge (`● Healthy`, green dot), database connection string copy button.
  * Center: Environment switcher (`Production` vs `Branch Preview`).
  * Right: `Backup / Export SQL` button, `Manage Plan / Storage` button, red-outlined `Pause / Delete Instance` trigger.
* Secondary Navigation Rail (Tab bar under header):
  * Tables / Database: A full visual database manager. Left list of tables (`users`, `profiles`, `orders`). Top-right button: `+ New Table`. Center: A spreadsheet-like data grid with row pagination, inline cell editing, column type indicators (`uuid`, `text`, `timestamp`), and a `Run SQL` query console drawer.
  * Auth: User accounts table (User ID, Email, Created date, Provider badge like Google/Email, Last sign-in). Top-right: `Invite User` and `Auth Settings` (toggle email confirmations, OAuth providers).
  * Storage: Bucket list (`avatars`, `uploads`, `documents`). File drag-and-drop upload zone, public/private bucket visibility toggles, and signed URL generation.
  * Edge Functions: List of serverless backend functions with invocation count graphs, average latency (ms), and error rate tags.
  * Cron / Scheduled Jobs: Schedule table (`0 0 * * *`), target functions, status toggles (`Active` / `Paused`), and `Run Now` test trigger.
  * Logs: Real-time log streaming terminal with level filter pills (`ALL`, `INFO`, `WARN`, `ERROR`) and live auto-scroll lock.
  * Secrets: Key-value table for production environment variables (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`). Values are masked (`••••••••`); right side has `Reveal`, `Edit`, and `+ Add Secret` buttons.

2. Analytics
High-level performance monitoring for published apps.
* Top Header Bar:
  * Left: App URL display (`yourapp.lovable.app`), live visitor counter (`● 3 active right now`).
  * Right: Date Range Picker dropdown (`Last 24 hours`, `Last 7 days` [default], `Last 30 days`, `Custom`), and `Export CSV` icon button.
* Metrics Summary Row (4 metric cards across the top):
  1. Unique Visitors: Big number (e.g. `1,420`), with sub-metric green/red percentage change (e.g. `+18.4% vs last week`).
  2. Total Pageviews: e.g. `5,890`.
  3. Average Session Duration: e.g. `2m 45s`.
  4. Bounce Rate: e.g. `34.2%`.
* Center Chart: Fluid SVG time-series area chart displaying daily visitors and pageviews with interactive hover tooltips.
* Bottom 2×2 Grid:
  * Top Pages: Table showing paths (`/`, `/pricing`, `/dashboard`), views count, and % share.
  * Top Referrers: Traffic sources (Direct, `google.com`, `twitter.com`, `github.com`).
  * Geographic Distribution: List of top countries with flag icons and visitor counts.
  * Devices & OS: Donut chart breakdown: Desktop vs Mobile vs Tablet.

3. Settings (Project Settings)
Split-screen layout with an inner left navigation menu (~200px) and a main configuration panel.
* Inner Left Tabs:
  1. General:
     * Project Name input (inline editable with `Save Changes` button).
     * Project Slug / URL preview.
     * Description textarea.
     * Project Icon / Thumbnail uploader.
     * Project Monitoring toggle (tracks runtime client errors).
     * Danger Zone (Red bottom panel): `Transfer Project` button and `Delete Project Permanently` button (requires typing project name to confirm).
  2. Knowledge (Memory System):
     * Core Rules Box: Persistent rules applied to every prompt (e.g., "Always use Tailwind dark mode", "Never use serif fonts").
     * Memory Files Table: List of structured markdown memories with columns: `Name`, `Type` (Design, Constraint, Preference, Feature), `Last Updated`, and `Delete`.
     * Top-Right Action: `+ Add Memory` modal trigger.
  3. Domains:
     * Top input: `Enter your custom domain (e.g., app.yourdomain.com)` with `Add Domain` button.
     * Active Domain Table: Shows Domain Name, SSL Status badge (`Active Let's Encrypt` / `Pending`), and DNS configuration records (`Type: CNAME`, `Name: @`, `Value: cname.lovable.app`). Copy icon next to DNS values.
  4. Git:
     * GitHub Repository integration card. Shows connected organization and repo (`owner/repo`), current sync branch (`main`), commit status, `Sync Now` manual push trigger, and `Disconnect Repository` button.

4. SEO & AI Search
Optimizing for both traditional search engines (Google) and AI answer engines (Perplexity, ChatGPT, Claude).
* Top Bar: Overall SEO Health Score circular gauge (e.g. `92/100`) and a `Re-run SEO Audit` button.
* Tab 1: Search Previews:
  * Interactive previews showing how the page appears when shared on Google Search, X (Twitter Cards), LinkedIn, and WhatsApp/Slack unfurls. Includes editable Title, Meta Description, and OpenGraph Image fields.
* Tab 2: AI Crawler & Semantic Structure:
  * Shows how LLM crawlers read your page's heading hierarchy (`H1` through `H3`), missing alt tags, structured schema JSON-LD validation, and robots.txt rules.
* Tab 3: Semrush Keyword Insights:
  * Table of relevant keywords, search volume, difficulty, and one-click action: `Optimize page for this keyword` (pre-fills the chat composer with a targeted prompt).

5. Security
* Header Bar: Security Grade badge (`A+`, `Passed`), total issues count (`0 Critical, 1 Medium`), and `Run Scan` button.
* Filter Pills: `All (1)`, `Critical (0)`, `High (0)`, `Medium (1)`, `Low (0)`.
* Issue Cards: Each detected security vulnerability renders as an expandable card:
  * Left: Severity badge (e.g., yellow `MEDIUM`), Vulnerability Title (e.g. `Outdated npm package: cross-spawn < 7.0.5`), CVE code link.
  * Description: Explanation of the risk and affected file path (`package.json`).
  * Right Action: High-priority button reading `Fix with Lovable`. Clicking this immediately switches back to the Chat Rail and submits an automated remediation prompt into the Build pipeline.

6. Payments
* Provider Switcher: Two cards at top: Paddle vs Stripe. Active provider has a green `Connected` pill; the other has a `Configure` button.
* Product Catalog: Table listing configured subscription tiers or one-off items: Product Name, Price, Currency, Billing Interval (Monthly/Yearly), Price ID.
* Top-Right Button: `+ Create Product` (modal to define title, price, and trial period).
* Webhook Tester: Live webhook receiver URL with a `Send Test Webhook` ping button and recent events log (`checkout.session.completed`, `customer.subscription.deleted`).

7. AI (Gateway & Spend)
* Monthly Allowance Bar: Visual progress bar showing consumed AI credits vs monthly limit.
* Default Model Selector: Dropdown to configure the primary model powering your in-app AI features (e.g. fast lightweight models vs high-reasoning models).
* Live Request Log: Table of AI calls made by your live app: Timestamp, Function Name, Model used, Token count (Prompt / Completion), Latency, Cost ($).

8. Agent Integrations (MCP Server)
* Master Switch: `Enable MCP Server` toggle switch.
* Connection Details Card: Displays the public MCP endpoint URL with a one-click `Copy URL` button.
* Tools Catalog: List of internal functions exposed as callable tools for AI agents (e.g. `get_product_list`, `create_order`, `search_knowledge_base`). Each tool shows its JSON input schema and a toggle to enable/disable it.

---

Part 3: The Slash (`/`) Skills System & Pre-Built Skills

1. What Happens When You Type `/` in the Composer
* When the cursor is in the chat textarea and you press `/` (either as the first character or after a space), the composer enters Command & Skill Selection Mode.
* A floating menu smoothly docks directly above the textarea:
  * Dimensions & Style: `w-80 max-h-72 overflow-y-auto`, rounded-xl, dark acrylic glass (`bg-zinc-950/95`, `backdrop-blur-md`, `border border-white/10`, `shadow-2xl`).
  * Instant Filter: As you continue typing after the slash (e.g. `/acc` or `/red`), the list dynamically filters down to matching skills.
  * Keyboard Navigation: Navigate with `ArrowUp` / `ArrowDown`, press `Enter` or `Tab` to select, and `Escape` to dismiss.
  * Selected State: Choosing a skill converts the command into a pill/chip pinned to the prompt box (e.g. `[Skill: Goal]`), allowing you to type your specific context immediately after it.

2. The Official Pre-Built Skills (Built by Lovable)
These skills are baked into the platform. They are read-only (cannot be edited or deleted) and are available in every workspace:

| Skill Command | Visual Icon | Purpose & Execution Workflow |
| :--- | :--- | :--- |
| `/goal` | 🎯 Bullseye / Target | Goal Runs: Turns the prompt into an autonomous objective. Instead of doing one turn and stopping, Lovable runs an iterative, self-verifying loop (planning → executing → testing against errors → adjusting) until the specific goal criteria are satisfied. |
| `/accessibility` | ♿ Accessibility / Human | WCAG Compliance Audit: Automatically reviews the app's components for color contrast ratios, keyboard accessibility (`Tab` indexing, focus rings), screen-reader ARIA labels, semantic HTML tags, and form input associations, then offers code fixes for failures. |
| `/redesign` | ✨ Sparkles / Palette | Visual & UI/UX Upgrade: Executes a top-to-bottom aesthetic elevation. Audits color tokens, typography scales, spacing density, micro-interactions, responsive states, and layout polish to eliminate generic design feel. |
| `/seo-reviews` | 🔍 Globe / Search | SEO & AEO Analysis: Audits meta titles, OpenGraph image tags, heading structure (`H1` uniqueness), URL slugs, sitemap configuration, and JSON-LD schema definitions for search engine optimization. |
| `/skill-creation` | 🛠️ Wrench / Plus | Interactive Skill Builder: Starts a guided conversation where Lovable helps you author, structure, test, and save a new custom workspace skill as a markdown playbook. |
| `/video-creation` | 🎥 Video Camera | Asset & Walkthrough Generation: Specialized workflow for generating interactive video teasers, UI motion recordings, or script assets for product launches. |

3. Workspace Skills (Custom Team Playbooks)
* Where They Come From: Defined at the workspace level under Workspace Settings → Skills.
* Storage & Structure: Stored as clean markdown files with YAML frontmatter:
  ```markdown
  ---
  name: launch-checklist
  description: Use when preparing to launch, ship, or share an app to production
  ---
  ## Pre-Flight Instructions
  1. Verify all routes have unique titles and meta descriptions.
  2. Confirm 404 page exists and has a return home link.
  3. Ensure responsive layout does not break below 375px.
  ```
* Discovery in Menu: Appear in the `/` dropdown under a dedicated Workspace Skills section with a team badge, right alongside the platform pre-built skills.

---

Part 4: Pragmatic Architectural Reality Check

When building this frontend clone:
1. The "More" Surface Switcher: Operates as a clean local state machine (`surface: "preview" | "code" | "cloud" | "analytics" | "settings" | "security" | "seo" | "payments"`). When clicked, it renders the exact layout described above.
2. The Slash Menu (`/`): Listens to textarea `onChange` / `onKeyDown`. When `/` is detected at cursor offset, it renders the floating dropdown with the 6 pre-built skills and mock custom skills, filtering live as the user types.
3. No Fake Backend Promises: We keep every surface, button, and table visually authentic to Lovable's production standards while wired to realistic local mock state, ready to bind to real services later without rewriting the presentation layer.

Would you like to switch to Build mode so we can implement the complete "More" surface views and the floating `/` skills composer into the project editor?

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3b137ee1-f429-49af-93e4-4185cdcf24b3).

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
