# AGENTS.md
### StreamSuite Storefront — Agent Architecture & Responsibilities

This project uses a multi-agent structure to keep development clean, modular, and predictable. Each agent is scoped to a single domain so patches never conflict, overwrite, or drift into unrelated areas.

This file explains what each agent does, where it operates, and how to use it correctly.

# StreamSuite Project — Agent Coverage Matrix
This section ensures that every development task in this project is covered by a dedicated agent. No task should fall outside an agent’s domain, and no agent should drift into another’s responsibilities.

This matrix applies to:
- StreamSuite storefront
- overlay/panel builds
- future StreamSuite-branded projects

---

## 1. Core StreamSuite Agent (Backend Logic)
**Covers:**
- Express routes
- server.js logic
- JSON persistence
- CRUD implementation
- slug generation rules
- backend validation
- protected admin route behavior

**Does NOT cover:**
- CSS
- layout
- uploads
- content copy
- SEO
- modal styling

---

## 2. Frontend/UI Agent (Visual System)
**Covers:**
- dark mode
- neon theme
- hero banner
- nav bar
- listing card layout
- product page layout
- modal styling
- responsive design
- storefront visual polish

**Does NOT cover:**
- backend logic
- admin validation
- upload handling
- JSON structure
- page content copy

---

## 3. Upload & Media Handling Agent (File & Asset Flow)
**Covers:**
- Multer upload logic
- file type validation
- media fallback behavior
- asset storage in /data/uploads
- broken/missing image handling
- admin-only upload restrictions

**Does NOT cover:**
- CSS
- page content
- route logic
- admin PIN enforcement
- layout redesign

---

## 4. Admin CRUD QA Agent (Validation & Regression)
**Covers:**
- admin listing CRUD QA
- admin page CRUD QA
- PIN enforcement checks
- destructive action safety
- duplicate slug detection
- regression testing for protected flows

**Does NOT cover:**
- implementing admin logic (only tests it)
- styling
- uploads
- content copy
- SEO

---

## 5. Content & Pages Agent (Content Logic & SEO)
**Covers:**
- page creation/editing
- slug uniqueness checks
- content rendering logic
- SEO-friendly copy
- page-route alignment
- storefront content QA
- alt text and accessibility copy

**Does NOT cover:**
- CSS
- backend logic
- upload handling
- admin validation
- modal styling

---

# Global Rules
1. **Every task must be assigned to exactly one agent.**
2. **No agent may modify files outside its domain.**
3. **Agents must follow the project’s Express/EJS/JSON architecture.**
4. **Agents must avoid broad refactors unless explicitly instructed.**
5. **Agents must preserve the StreamSuite brand aesthetic and structure.**

---

# How to Choose the Correct Agent
Use this quick selector:

- Backend logic → Core StreamSuite Agent
- UI, layout, styling → Frontend/UI Agent
- Uploads, media, assets → Upload & Media Handling Agent
- Admin validation/regression → Admin CRUD QA Agent
- Page content, SEO, rendering → Content & Pages Agent

---

# Nothing Left Uncovered
This matrix ensures:
- backend logic is covered
- frontend styling is covered
- uploads/media are covered
- admin validation is covered
- content/SEO is covered

No task in this project falls outside an agent’s domain.

This guarantees stable, predictable development across all StreamSuite builds.

---

# Legacy Agent Guidance
The project originally used a simplified agent model, but this matrix is the authoritative coverage definition for all work.

## 1. Core StreamSuite Agent
**File:** streamsuite-storefront.agent.md
**Domain:** Backend logic, routing, JSON persistence, CRUD implementation.

### Responsibilities
- Express route updates
- Listing/page CRUD logic
- JSON-backed data handling
- Slug generation logic
- Server-side validation
- Safe backend patches without layout or styling changes

### Use this agent for:
- Backend fixes
- CRUD logic updates
- Slug validation improvements
- server.js patches

---

## 2. Frontend/UI Agent
**File:** frontend-ui.agent.md
**Domain:** Visual system, layout, styling, responsive design.

### Responsibilities
- Dark mode + neon theme
- Hero banner styling
- Nav bar redesign
- Listing card layout
- Product page presentation
- Modal styling
- Responsive layout fixes

### Use this agent for:
- UI redesigns
- Dark mode improvements
- Hero banner tweaks
- Listing card layout fixes

---

## 3. Upload & Media Handling Agent
**File:** upload-media.agent.md
**Domain:** File uploads, media validation, asset fallback logic.

### Responsibilities
- Multer upload flow
- File type validation
- Safe storage in /data/uploads
- Broken/missing image fallback
- Media field consistency
- Admin-only upload restrictions

### Use this agent for:
- Upload validation fixes
- Media fallback improvements
- Upload modal QA

---

## 4. Admin CRUD QA Agent
**File:** admin-crud-qa.agent.md
**Domain:** Validation, regression testing, admin flow safety.

### Responsibilities
- PIN enforcement checks
- Duplicate slug detection
- Delete confirmation safety
- Regression testing for admin routes
- Validation gap detection
- Protected route QA

### Use this agent for:
- Admin flow QA
- Slug duplication checks
- PIN enforcement validation

---

## 5. Content & Pages Agent
**File:** content-pages.agent.md
**Domain:** Page content, SEO consistency, slug/page alignment.

### Responsibilities
- Page creation/editing
- Slug uniqueness checks
- Content rendering logic
- SEO-friendly copy consistency
- Page-route alignment
- Content QA

### Use this agent for:
- Page creation
- Content polish
- SEO consistency checks

---

# Future Agents (Optional)
If needed, you can add:

- Branding/Voice Agent
- Performance Optimization Agent
- Deployment Agent (Railway-specific)
- Asset Packaging Agent (for overlays/panels bundles)
