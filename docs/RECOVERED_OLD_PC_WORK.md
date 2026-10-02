# Recovered Old PC Work

> Recovery inventory for the historical DSOBA implementation on the older development PC.
> This document records what was preserved and what still requires review. It does not classify work as KEEP or DISCARD.

## 1. Source machine summary

- Source project path: `C:\local-server\dsoba-mobile-demo`
- Project type confirmed from `package.json`: Nuxt application using Nuxt 3 and Tailwind CSS.
- Confirmed development command: `npm run dev`.
- Confirmed production build command: `npm run build`.
- The project was previously served locally at `http://localhost:3000`.
- Git baseline was pushed to the private remote currently configured as `dsoba_revamp`.
- Recovery branch: `recovery/old-pc-work`.

## 2. Historical projects/folders found

- The local project is the DSOBA mobile/prototype application at `C:\local-server\dsoba-mobile-demo`.
- Additional historical DSOBA folders outside this project have not yet been fully inventoried.
- Any adjacent folders should be reviewed before deciding whether they belong in this recovery branch.

## 3. Frontend work found

- Nuxt-based frontend application structure.
- Tailwind CSS integration is declared in `package.json`.
- Pages, layouts, composables, components, and static assets require file-level review and should be preserved for later classification.
- No frontend files were intentionally redesigned or refactored during recovery.

## 4. Member portal work found

- The project history is understood to include member-facing/mobile prototype work, but the exact routes and components require verification from the source tree.
- Member portal pages, member directory UI, application form UI, and related flows are retained for review where present in the project.

## 5. Editorial Heritage work found

- Editorial Heritage implementation is an explicit historical recovery target.
- Exact route/component/file locations require a completed source-tree inventory.
- No Editorial Heritage files were intentionally deleted, rewritten, or redesigned during recovery.

## 6. Components/assets found

- Nuxt/Tailwind shared UI implementation is present in the project baseline.
- Historical targets include navigation, sliders/carousels, layout components, shared components, CSS/design tokens, images, and other media assets.
- Exact asset and component lists remain to be enumerated from the repository tree.

## 7. Backend/API work found, if any

- No backend service has been confirmed from the available project metadata.
- Any API integration attempts, mock data, server routes, or WordPress/API configuration require source-tree review.

## 8. Database work found, if any

- No database schema, migration, or database service has been confirmed from the available project metadata.
- Laragon/PHP/MySQL dependencies, if any, require separate verification.

## 9. Experimental/incomplete work

- This recovery branch may contain unfinished prototype flows, temporary data, experimental UI, or incomplete integrations.
- Such work is intentionally documented for later review and has not been silently removed.

## 10. Files deliberately excluded

The recovery should exclude or ignore generated/local-only material, including:

- `node_modules/`
- `.nuxt/`
- `.output/`
- `dist/`
- `build/`
- local `.env` files and credentials
- temporary caches and logs
- machine-specific files unrelated to the DSOBA implementation

## 11. Potentially reusable work

Potentially reusable areas to review against the RFP, Submitted Proposal, and Project Plan include:

- Editorial Heritage UI and content presentation
- public website pages
- member portal and member directory UI
- application form UI
- event pages
- gallery/media UI
- navigation, sliders, and carousels
- shared layout/components and CSS/design tokens
- prototype data and API integration attempts

These are inventory targets only. No KEEP/DISCARD decision has been made.

## Traceability and review notes

- **RFP:** Use the baseline RFP to assess requirements and acceptance intent.
- **Submitted Proposal:** Use the submitted proposal to interpret committed scope.
- **Project Plan:** Use the implementation plan for sequencing and rollout context.
- Conflicts or ambiguities should be flagged during later review rather than resolved silently.

