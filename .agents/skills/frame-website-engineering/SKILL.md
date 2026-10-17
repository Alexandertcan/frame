---
name: frame-website-engineering
description: >-
  Build and refine FRAME's polished, responsive multi-page website and interactive
  product demos. Use when changing FRAME's visual design, navigation, motion,
  browser interactions, generated-site previews, or static deployment.
---

# FRAME Website Engineering

Use this project-specific workflow when implementing or revising FRAME. Preserve
the requested scope and existing product behavior while making each change
visually coherent, usable, and verifiable.

## Start from the project

- Inspect `README.md`, relevant reports, existing routes, components, styles,
  tests, and `git status` before editing. Reuse established tokens and patterns;
  do not replace the app structure to make a local change easier.
- Translate the request into a short checklist of affected routes, interactions,
  responsive states, and acceptance evidence. Keep unrelated pages untouched.
- When a user supplies reference pages, inspect the actual page and at least one
  meaningful scroll or interaction state. Record what was observable; do not
  claim to have inspected unavailable content.

## Design and implement

- Treat FRAME as a working website-design product. Make the next action obvious,
  keep product copy concrete, and make examples clearly identifiable as samples.
- Establish a clear visual hierarchy before adding effects. Use deliberate type
  scale, spacing, contrast, image placement, and page rhythm; avoid repeating
  identical card grids or motion treatments across every section.
- Keep the shared visual language consistent across marketing routes, the
  creation flow, editor, and exported pages. Prefer existing design tokens and
  focused components to duplicated one-off styling.
- Give controls real behavior and feedback. Support keyboard use, focus states,
  browser navigation, and touch; keep decorative effects from obscuring text or
  reducing control clarity.
- Make scroll motion communicate a change of state or focus. Vary the treatment
  by section, favor transform and opacity, avoid layout jumps, and honor
  `prefers-reduced-motion`. Keep ordinary scrolling intact.
- Use blur alone only for a subdued translucent surface. For a glass treatment,
  combine a legible translucent fill with visible backdrop contours, edge
  highlights, restrained refraction or distortion, and sufficient contrast.
- For 3D or WebGL scenes, make the subject recognizable and purposeful. Provide
  visible loading and failure states, a static fallback, and a lighter mobile
  treatment. Do not imply that a static fallback is a live 3D scene.
- Keep demo behavior explicit. Do not describe preset output as real AI
  generation, an unconfigured login as working authentication, or a plan card as
  a completed payment flow.

## Keep routing and publishing reliable

- Use the project's route helpers for internal links and assets so local root
  hosting and GitHub Pages subpath hosting both work.
- For GitHub Pages, check `vite.config.ts`, `scripts/build-pages.mjs`, and
  `.github/workflows/pages.yml` together. Static SPA routes need direct-load
  documents or an equivalent tested fallback; resource URLs must retain the
  repository base path. Keep `configure-pages`, artifact upload, and deploy
  steps aligned.
- Do not expose API credentials in client code or publish local secrets,
  screenshots, build output, or test artifacts unless they are deliberate
  project assets.

## Verify the actual experience

- Run the smallest relevant test first, then the full `npm test` and production
  build when the change can affect shared behavior or deployment.
- For UI changes, use a real browser when available. Check the requested route
  by direct URL, refresh, internal navigation, browser back/forward, console
  errors, and at least one desktop and narrow viewport. Inspect screenshots;
  do not treat a successful build or a page merely rendering as visual approval.
- Exercise the changed controls and important empty, loading, failed, or
  reduced-motion states. Report browser checks as unverified if the browser
  runtime or required service is unavailable.
- For publishing, verify the workflow result and request the deployed URL and
  static assets over HTTP. Distinguish static demo capability from server-side
  API capability.
- Report only commands actually run, their outcomes, material warnings, and any
  remaining limits. Keep the final summary tied to the user's requested scope.
