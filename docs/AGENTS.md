# UltraCem Chatbot - Coding Agent Instructions

**Version:** 2.0  
**Date:** May 23, 2026  
**Target:** AI coding agents working in this repository

## Mission

Build and maintain the UltraCem materials calculator with Next.js 14, Supabase, Tailwind CSS, Gemini API, Zustand, Zod, and Bun. Follow `docs/specs.md` for product behavior and `docs/foundations.md` for all visual decisions.

When documents conflict, the priority order is:

1. `docs/foundations.md` for brand, UI, UX, color, typography, spacing, and accessibility.
2. `docs/specs.md` for product scope, calculations, contracts, and domain behavior.
3. This file for repository conventions.

## Package Manager

- Use Bun for dependency and script commands: `bun install`, `bun run dev`, `bun run build`, `bun run test`.
- Do not introduce `npm`, `yarn`, or `pnpm` lockfiles.
- Keep `package.json` scripts standard and executable with `bun run`.

## App Architecture

The App Router lives in root `app/`. Shared code lives in `src/`.

```text
app/
  layout.tsx
  page.tsx
  chat/page.tsx
  admin/**
  api/**
src/
  components/
    ui/
    landing/
    chat/
    admin/
    brand/
  domains/
  lib/
  store/
  types/
```

Rules:

- Use Server Components by default.
- Mark components with `"use client"` only when using hooks, browser APIs, or client state.
- Route handlers belong in `app/api/**/route.ts`.
- Business logic belongs in `src/domains/**` as pure TypeScript where possible.
- Shared utilities, clients, validation, and tokens belong in `src/lib/**`.
- Imports should use `@/*`, which maps to `src/*`.
- Do not recreate a root `lib/`, `components/`, or `hooks/` directory.

## Component Architecture Compliance

Every frontend component lives in its own kebab-case folder under `src/components/<feature>/<component>/`.

Required files:

- `<component>.tsx` for the visual component.
- `index.ts` as the public barrel.

On-demand files:

- `use-<component>.ts` when the component has extractable state, refs, effects, or event handlers.
- `<component>-store.ts` when the component owns shared Zustand state.
- `<component>-types.ts` when the component has exported or non-trivial interfaces.
- `<component>-data.ts` when the component consumes editable static arrays or dictionaries.

Example:

```text
chat-container/
  chat-container.tsx
  use-chat-container.ts
  chat-container-types.ts
  chat-container-data.ts
  index.ts
```

Naming rules:

- Files and folders use kebab-case.
- React exports use PascalCase.
- Hooks use camelCase with the `use` prefix.
- Do not add flat component files like `WelcomeScreen.tsx`, `ProductForm.tsx`, or `Button.tsx`.

## Backend Layer Compliance

Each domain in `src/domains/<domain>/` uses layer suffixes:

- `<domain>.service.ts` for business logic.
- `<domain>.types.ts` for public domain types.
- `<domain>.schema.ts` for Zod validation.
- `<domain>.repository.ts` for data access when needed.
- `<domain>.mapper.ts` for mapping between persistence and domain shapes.
- `index.ts` for the public barrel.

Route handlers in `app/api/**/route.ts` validate input and delegate to domain services. They should not contain business logic.

## Import Rules

- Import public component APIs from package barrels, for example `@/components/ui` or `@/components/chat/chat-container`.
- Do not import internal files from another component package, for example `@/components/chat/chat-container/use-chat-container`.
- Shared feature barrels may reexport child component barrels, but application routes should prefer the nearest public barrel.

## Design System Compliance

The frontend direction is **UltraCem Institucional Sobrio**. It is calm, professional, close to `ultracem.co`, and uses yellow as a controlled accent.

### Required Sources

- Design tokens: `src/lib/design-tokens.ts`
- Global utilities: `app/globals.css`
- UI primitives: `src/components/ui/`
- Brand guide: `docs/foundations.md`

### Required UI Primitives

Use these before creating ad hoc classes:

- `Container`
- `Section`
- `Eyebrow`
- `Button`
- `Card`

New landing or marketing sections should compose `Section` and `Container`. New buttons should use `Button` variants instead of hand-written button class strings.

### Allowed Tokens

Use the UltraCem Tailwind tokens:

- Colors: `ultracem-blue`, `ultracem-yellow`, `ultracem-green`, `ultracem-gray`, `ultracem-surface`, `ultracem-border`
- Type: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-body-sm`, `text-caption`, `text-button`
- Radius: `rounded-uc-button`, `rounded-uc-card`, `rounded-uc-input`, `rounded-full`
- Shadow: `shadow-uc-card`, `shadow-uc-modal`
- Layout: `max-w-uc-container`, `container-uc`

### Prohibited UI Patterns

Do not introduce:

- Orange brand colors or classes.
- `Bebas Neue`, alternate display fonts, or extra font imports.
- `font-display`.
- Technical blueprint decoration such as grid backgrounds, corner brackets, dashed technical borders, noise overlays, diagonal construction lines, or floating hero cards.
- Purple gradient SaaS aesthetics.
- Arbitrary pixel typography like `text-[13px]` when a token exists.
- Arbitrary radii like `rounded-[20px]` when a token exists.

### Motion

Keep motion minimal and useful:

- Allowed: `animate-fade-in-up`, `animate-slide-in-left`, `animate-slide-in-right`, `stagger-1` through `stagger-5`, typing dots.
- Respect `prefers-reduced-motion`.
- Avoid infinite decorative motion.

### Accessibility

- Preserve `<html lang="es">`.
- Keep text contrast WCAG AA.
- Use visible focus states with `ring-uc-focus`.
- Keep touch targets at least 44px.
- Use `next/image` for images and descriptive `alt` text.
- Form controls need visible labels or `aria-label`.

## Supabase and Data Rules

- Never expose service role keys to the client.
- Keep RLS enabled except for intentionally public product reads.
- Generate and use TypeScript database types.
- Validate request bodies with Zod.
- Translate technical errors into clear Spanish user messages.

## Gemini Rules

- Call Gemini only from server code.
- Validate model output with Zod or explicit parsing.
- Use low temperature for stable calculation output.
- Sanitize logs and never log secrets.

## Coding Standards

- TypeScript strict mode stays enabled.
- Avoid `any` unless there is a documented reason.
- Use kebab-case for file and folder names, PascalCase for React components and types, camelCase for functions, and SCREAMING_SNAKE_CASE for constants.
- Prefer early returns and pure functions in domain code.
- Do not mutate arrays or objects when simple immutable operations work.

## Verification

Before considering frontend work complete:

- `bun run build` passes.
- Search results in `app/` and `src/` contain no prohibited design patterns.
- New UI uses `src/components/ui/` primitives where appropriate.
- Main flows `/` and `/chat` remain mobile-first and usable with one hand.
