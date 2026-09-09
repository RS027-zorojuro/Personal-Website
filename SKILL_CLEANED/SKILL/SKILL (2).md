---
name: ui-ux-skill
description: Use this skill whenever building, redesigning, polishing, or reviewing a website or web application's interface. Produces a high-quality, modern, usable, accessible, maintainable interface rather than a generic AI-generated page, using a curated reference library, a component-reuse workflow, and design-system consistency rules.
---

# UI/UX Skill

## Purpose

The goal is to produce a **high-quality, modern, usable, accessible, maintainable interface** rather than a generic AI-generated page.

The UI/UX reference sites below are the preferred sources for components, interaction patterns, animation ideas, icons, layouts, and visual inspiration. **Fetch a reference URL before citing or copying from it** — do not assume its current contents from memory, since these libraries update frequently.

---

## 1. UI/UX Reference Library

| Library | URL | Use for | Instruction |
|---|---|---|---|
| HyperUI | https://hyperui.dev/ | Tailwind sections, nav, forms, cards, marketing layouts | Check before inventing a generic implementation from scratch |
| Magic UI | https://magicui.design/docs/components | Animated React+Tailwind components, hero sections | Reference for polished animated interactions when the project benefits from them — don't add animation merely for decoration |
| Coss UI | https://coss.com/ui | Base-UI-based patterns, buttons, inputs, dialogs, nav | Prefer when it fits the product's interaction model and visual language |
| Aceternity UI | https://ui.aceternity.com/ | Animated hero sections, background effects, premium landing pages | Use selectively for high-impact sections; avoid motion/glow/blur that hurts readability or accessibility |
| React Bits | https://reactbits.dev/ | Copy-paste animated React components, micro-interactions | Check before implementing a custom animated component |
| Spectrum UI | https://ui.spectrumhq.in/ | Animated blocks, application UI patterns | Use when it's a stronger implementation than building manually |
| Animata | https://animata.design/components | Motion effects, micro-interactions | Prefer subtle motion over distracting animation |
| Cult UI | https://www.cult-ui.com/ | shadcn-style components, blocks, templates | Check when the project uses or can reasonably use shadcn/ui architecture |
| Motion Primitives | https://motion-primitives.com/docs/accordion | Transitions, accordions, motion patterns | Prefer for reusable motion behavior over custom animation logic |
| Inspira UI | https://inspira-ui.com/docs/en/components/backgrounds/aurora-background | Animated backgrounds, visual effects | Use only when it supports hierarchy/branding — never let it compete with primary content or controls |
| 21st | https://21st.dev/ | Large component/template/theme collection | Search when you need multiple alternatives for a component or visual direction |
| Lucide | https://lucide.dev/ | Icons | Prefer for interface icons unless the product has a justified icon system or another licensed library |

---

## 2. Mandatory UI/UX Workflow

Do not immediately invent every component from scratch. Follow this sequence:

### Step 1 — Understand the product
Determine: primary user, primary task, secondary tasks, information hierarchy, core screens, important/destructive actions, empty/loading/error states, mobile requirements, accessibility requirements.

### Step 2 — Search the UI/UX library
Before implementing a major UI pattern, check the relevant source(s) from the table above.

### Step 3 — Compare options
For important UI elements, weigh candidate implementations on: visual fit, usability, accessibility, responsiveness, performance, maintainability, dependency cost, complexity, licensing, consistency with the rest of the app.

### Step 4 — Reuse before reinventing
Preference order:
1. Existing project design system / approved components
2. The UI/UX reference library above
3. Small custom components
4. Large custom implementations, only when necessary

Never copy a component blindly — adapt it to the application's visual system and requirements.

---

## 3. UX Quality Rules

**Prefer:** clear hierarchy, obvious primary actions, predictable navigation, clear feedback, immediate validation where appropriate, helpful empty states, recoverable errors, visible progress, consistent terminology, minimal cognitive load.

**Avoid:** mystery-meat navigation, excessive modals, unnecessary steps, hidden important actions, tiny click targets, excessive animation, visual clutter, inconsistent wording.

---

## 4. Vibe-Coding Build Workflow

**Before coding**, infer: page/screen inventory, component inventory, design tokens, data model assumptions, API boundaries, state model, responsive behavior, accessibility requirements, security considerations.

**During coding**, prefer: small reusable components, typed interfaces, clear naming, predictable state management, existing project conventions, minimal dependencies, server-side enforcement for security-sensitive behavior.

**After coding**, review: visual, functional, responsive, accessibility, security, performance, dependency/license, error/empty/loading states.

---

## 5. Design-System Consistency

Do not design every page independently. Establish and reuse: typography scale, spacing scale, color tokens, border radius, shadows, buttons, inputs, cards, dialogs, dropdowns, tooltips, tabs, navigation, toasts, tables, form patterns, loading/empty/error states.

Build reusable components rather than repeating near-identical markup.

**Avoid:** random font sizes, random border radii, random shadows, inconsistent icon sizes, multiple button styles for the same action, unrelated animation styles, arbitrary spacing values.

---

## 6. Responsive Requirements

Design mobile-first where appropriate. Check small phones, large phones, tablets, laptops, large desktops. Never assume a desktop layout automatically becomes usable on mobile.

Test: navigation, tables, forms, modals, drawers, cards, charts, long text, touch targets, sticky elements.

---

## 7. Interaction & State Requirements

Every meaningful interactive component should consider: default, hover, focus, active, disabled, loading, success, error, empty, permission-denied, and offline/network-failure states where relevant. Do not build only the happy path.

---

## 8. Accessibility Pass

Explicitly check: keyboard-only operation, focus visibility, focus order, semantic structure, form labels, error announcements, screen-reader names, reduced-motion support, color contrast.

---

## 9. Source & Licensing Discipline

Before copying or adapting anything from a reference site:
- Check the library's current usage/license terms.
- Check whether attribution is required.
- Check whether the referenced asset is itself sourced from elsewhere (fonts, icons, images).
- Prefer package-native/official install instructions over copied snippets.

Never present an adapted third-party component as fully original work.

---

## 10. When the AI Cannot Decide

When multiple reasonable design choices exist and the decision materially affects the product, **refer the choice to the user instead of silently deciding.**

Examples: dark vs. light direction, glassmorphism vs. solid cards, sidebar vs. top nav, dense vs. spacious dashboard, animation-heavy vs. restrained motion, competing hero compositions, which of two strong patterns becomes the standard, which theme best represents the brand.

Use this structure:

> **UI Decision Needed**
>
> **Option A:** ...
>
> **Option B:** ...
>
> **Recommendation:** ...
>
> **Trade-off:** ...
>
> **Pick:** A / B

For minor implementation details with no meaningful product impact, choose a sensible option without interrupting the user.

---

## 11. UI/UX Safety Rule

UI quality must never override security, privacy, accessibility, data integrity, legal/compliance obligations, or user safety. A visually impressive interface is not a successful implementation if it creates security, privacy, accessibility, or reliability problems. (See the separate `security-production-skill` for the full technical checklist.)

---

## Final Mandatory Rule

Every build must:
1. Use this reference library as the first stop for visual/component decisions.
2. Reuse suitable components before writing custom UI.
3. Preserve a coherent design system across pages.
4. Ask the user to decide when a major design choice can't be responsibly resolved alone.
5. Include loading, empty, error, disabled, focus, and responsive states where applicable.
6. Never silently trade away security, privacy, accessibility, legal awareness, or data integrity for visual polish.
