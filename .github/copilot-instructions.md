# StreamSuite Project Guidelines

## Project Overview
This repo is a small storefront app built with Node.js, Express, and EJS. The app serves product pages, static content pages, and a protected admin layer for managing listings and pages.

Key project structure:
- `server.js` — Express routes, admin flows, and JSON-backed data loading
- `data/` — persisted storefront data (`listings.json`, `pages.json`)
- `views/` — EJS templates for public pages and layout
- `public/` — CSS and frontend scripts

## Core Architecture
- Use the existing Express + EJS architecture rather than introducing a different framework pattern.
- Listing and page data is stored in JSON files; keep changes consistent with that model.
- Admin actions are PIN-protected and should remain server-side validated.
- Public page rendering and admin operations are intentionally separate concerns.

## Agent Usage Rules
When working in this repo, prefer the most specific agent for the task:
- `Admin/PIN Agent` — PIN logic, modal gating, admin route patches, slug validation, price logic, delete confirmation
- `Frontend/UI Agent` — dark neon theme, layout, cards, nav, modals, responsive fixes, EJS/CSS work
- `Upload & Media Handling` — file/media validation, image issues, upload workflows, asset storage logic
- `Admin CRUD QA` — regression testing and QA on create/update/delete flows and admin validation gaps
- `Content & Pages Agent` — page content, slugs, page rendering, and storefront copy changes
- `StreamSuite Storefront Specialist` — broader storefront work spanning routes, views, and data when no narrower agent is a fit

Use the generic default agent only for lightweight, general questions that do not map to a specific repo workflow.

## Coding Conventions
- Keep changes small and targeted; do not broaden scope without cause.
- Match existing naming patterns, route conventions, and data shapes before refactoring.
- Preserve the current admin PIN flow and validation model instead of weakening it.
- Prefer server-side validation for any user-controlled input, especially slugs, prices, redirects, and destructive actions.
- Keep EJS and CSS changes aligned with the dark neon storefront aesthetic.

## Validation Expectations
- When fixing backend logic, validate the affected route or behavior with the smallest practical runtime check.
- When changing admin flows, verify both the success path and failure path.
- When changing UI, verify layout behavior remains consistent across common view sizes.

## Avoid
- Do not bypass the admin PIN or weaken protected routes.
- Do not introduce a new storage or app architecture without a clear need.
- Do not mix admin logic into public page rendering or vice versa.
- Do not make broad style rewrites that conflict with the existing storefront theme.
