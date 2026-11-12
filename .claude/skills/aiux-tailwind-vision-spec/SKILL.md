---
name: aiux-tailwind-vision-spec
version: 1
description: >
  Deterministic, pre-computed mapping from visual UI elements to AIUX component
  classes and tokens defined in karuna/components/core/src/styles/tailwind.css.
---

# AIUX Tailwind / DaisyUI Vision-to-Spec Skill

## Purpose

Deterministic, pre-computed mapping from visual UI elements in screenshots to the exact AIUX component classes and tokens defined in `karuna/components/core/src/styles/tailwind.css`.

Use this skill **before** MCP discovery. It covers the common DaisyUI components used by the AIUX design system (all prefixed with `aiux-`). Fall back to `search_components` / `get_component` only when a visual element does not match any signature here, or when props are ambiguous.

---

## 1. Library Fingerprint

| Property | Value |
| --- | --- |
| Framework | Tailwind CSS v4 + DaisyUI v5 |
| Component prefix | `aiux-` (e.g. `aiux-btn`, `aiux-card`) |
| Theme | Horizon 2.0 / ServiceNow |
| Token source | `tailwind.css` custom properties + DaisyUI theme tokens |
| Icon component | `sn-aix-icon` with outline variants only (append `-outline`) |
| Icon sizes | `xs` 12px, `sm` 16px, `md` 20px, `lg` 24px, `xl` 32px |

**Rule:** Always prefer `aiux-*` DaisyUI components over custom HTML. Do not invent custom classes or hardcode hex colors unless the design system explicitly requires it.

---

## 2. Visual Decision Tree

Use these rules to identify the component class from a screenshot in a single pass.

### 2.1 Interactive controls

| Visual cue | Component | Base class |
| --- | --- | --- |
| Clickable rectangle with label, possibly with icon | Button | `aiux-btn` |
| Underlined text, clickable | Link | `aiux-link` |
| Single-line text box | Input | `aiux-input` |
| Multi-line text box | Textarea | `aiux-textarea` |
| Dropdown selector | Select | `aiux-select` |
| File picker | File input | `aiux-file-input` |
| Small square with checkmark | Checkbox | `aiux-checkbox` |
| Circle with dot | Radio | `aiux-radio` |
| Sliding on/off switch | Toggle | `aiux-toggle` |
| Range slider | Range | `aiux-range` |
| Square icon-only button | Icon button | `aiux-btn aiux-btn-square` + `sn-aix-icon` |

### 2.2 Feedback / status

| Visual cue | Component | Base class |
| --- | --- | --- |
| Colored banner with icon + text | Alert | `aiux-alert` |
| Horizontal progress bar | Progress | `aiux-progress` |
| Spinner / loading dots | Loading | `aiux-loading` |
| Small popup that appears on hover/focus | Tooltip | `aiux-tooltip` |
| Small colored label (read-only) | Badge | `aiux-badge` |
| Rounded removable tag / chip | Pill | `aiux-pill` |
| Status dot with text | Status | `aiux-status` |

### 2.3 Data display / layout

| Visual cue | Component | Base class |
| --- | --- | --- |
| Rectangle with header, body, optional footer | Card | `aiux-card` |
| Expandable section with title | Collapse / Accordion | `aiux-collapse` / `aiux-accordion` |
| Circle with image or initials | Avatar | `aiux-avatar` |
| Horizontal navigation tabs | Tabs | `aiux-tabs` |
| List of navigation links | Menu | `aiux-menu` |
| Popup menu attached to button | Dropdown | `aiux-dropdown` |
| Path of links separated by chevrons | Breadcrumbs | `aiux-breadcrumbs` |
| Data rows with headers | Table | `aiux-table` |
| Numbered step indicators | Steps | `aiux-steps` |
| Vertical timeline | Timeline | `aiux-timeline` |
| Horizontal line separator | Divider | `aiux-divider` |
| Page numbers / prev/next | Pagination | `aiux-pagination` |

### 2.4 Loading placeholders

| Visual cue | Component | Base class |
| --- | --- | --- |
| Gray animated rectangle | Skeleton | `aiux-skeleton` |
| Gray text lines | Skeleton text | `aiux-skeleton aiux-skeleton-text` |
| Gray circle placeholder | Skeleton circle | `aiux-skeleton aiux-skeleton-circle` |
| Gray card placeholder | Skeleton card | `aiux-skeleton aiux-skeleton-card` |
| Gray list rows | Skeleton list | `aiux-skeleton aiux-skeleton-list` |

---

## 3. Component Catalog

For every component, the **base class** is required. Variants, sizes, and states are optional modifiers.

### 3.1 Button

**Base class:** `aiux-btn`

**Visual signatures:**
- Rectangular clickable control with centered text.
- May contain leading/trailing icon.
- Icon-only version is square.

**Color variants (solid):**
- `aiux-btn-primary` — main CTA
- `aiux-btn-secondary` — secondary action
- `aiux-btn-accent` — accent action
- `aiux-btn-neutral` — neutral action
- `aiux-btn-info` — informational action
- `aiux-btn-success` — positive action
- `aiux-btn-warning` — caution action
- `aiux-btn-error` — destructive action
- `aiux-btn-ghost` — subtle/no background
- `aiux-btn-link` — looks like a link

**Style variants:**
- `aiux-btn-outline` — bordered, transparent background
- `aiux-btn-soft` — tinted background
- `aiux-btn-dash` — dashed border

**Sizes:**
- `aiux-btn-xs`
- `aiux-btn-sm`
- `aiux-btn-md` (default)
- `aiux-btn-lg`
- `aiux-btn-xl`

**Shape modifiers:**
- `aiux-btn-square` — icon button
- `aiux-btn-circle` — circular icon button
- `aiux-btn-wide` — wider button
- `aiux-btn-block` — full width
- `aiux-btn-ghost` — hover-only background
- `rounded-full` — pill shape (status pills)

**States:**
- `aiux-btn-active`
- `aiux-btn-disabled` (or `disabled` attribute)
- `aiux-loading` — loading spinner replaces content
- `no-animation` — disable press animation

**Rules:**
- Primary CTA: `aiux-btn-primary aiux-btn-sm` (solid, no variant).
- Secondary CTA: `aiux-btn-primary aiux-btn-outline aiux-btn-sm`.
- Toolbar icon: `aiux-btn-ghost aiux-btn-xs aiux-btn-square` + `sn-aix-icon`.
- Destructive: `aiux-btn-error aiux-btn-outline aiux-btn-sm`.
- Dropdown list item: `aiux-btn-ghost aiux-btn-sm w-full justify-start rounded-none`.
- **Do not use `aiux-btn-soft` on light backgrounds for buttons** — too washed out.

### 3.2 Input

**Base class:** `aiux-input`

**Color variants:**
- `aiux-input-primary`
- `aiux-input-secondary`
- `aiux-input-accent`
- `aiux-input-info`
- `aiux-input-success`
- `aiux-input-warning`
- `aiux-input-error`
- `aiux-input-ghost`

**Sizes:**
- `aiux-input-xs`
- `aiux-input-sm`
- `aiux-input-md` (default)
- `aiux-input-lg`
- `aiux-input-xl`

**States:**
- `aiux-input-disabled`
- `aiux-input-bordered` (default)
- `aiux-input-ghost` (no border)

**Common combos:**
- Form field: `aiux-input aiux-input-bordered aiux-input-sm`
- Error state: `aiux-input aiux-input-error`
- With leading icon: wrap in `aiux-input-group` or use absolute-positioned `sn-aix-icon`.

### 3.3 Textarea

**Base class:** `aiux-textarea`

**Variants:** same color variants as input.

**Sizes:** `aiux-textarea-xs`, `aiux-textarea-sm`, `aiux-textarea-md`, `aiux-textarea-lg`, `aiux-textarea-xl`.

### 3.4 Select

**Base class:** `aiux-select`

**Variants:** same color variants as input.

**Sizes:** `aiux-select-xs`, `aiux-select-sm`, `aiux-select-md`, `aiux-select-lg`, `aiux-select-xl`.

### 3.5 Checkbox, Radio, Toggle

**Base classes:**
- `aiux-checkbox`
- `aiux-radio`
- `aiux-toggle`

**Color variants:** `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`.

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`.

**States:** `aiux-checkbox-disabled`, `aiux-toggle-disabled`, `aiux-radio-disabled`, `checked`.

### 3.6 File input

**Base class:** `aiux-file-input`

**Color variants:** same palette.
**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`.

### 3.7 Label, Fieldset, Range

- `aiux-label` — form labels
- `aiux-fieldset` — grouped form controls
- `aiux-range` — range slider

### 3.8 Alert

**Base class:** `aiux-alert`

**Color variants:** `aiux-alert-info`, `aiux-alert-success`, `aiux-alert-warning`, `aiux-alert-error`, `aiux-alert-primary`, `aiux-alert-secondary`, `aiux-alert-accent`, `aiux-alert-neutral`.

**Visual signature:** horizontal banner with left icon, title, and optional close button.

### 3.9 Progress

**Base class:** `aiux-progress`

**Color variants:** `aiux-progress-primary`, `aiux-progress-secondary`, `aiux-progress-accent`, `aiux-progress-info`, `aiux-progress-success`, `aiux-progress-warning`, `aiux-progress-error`, `aiux-progress-neutral`.

**Sizes:** `aiux-progress-xs`, `aiux-progress-sm`, `aiux-progress-md`, `aiux-progress-lg`, `aiux-progress-xl`.

### 3.10 Loading

**Base class:** `aiux-loading`

**Variants:** `aiux-loading-spinner`, `aiux-loading-dots`, `aiux-loading-ring`, `aiux-loading-ball`, `aiux-loading-bars`, `aiux-loading-infinity`.

**Sizes:** `aiux-loading-xs`, `aiux-loading-sm`, `aiux-loading-md`, `aiux-loading-lg`, `aiux-loading-xl`.

### 3.11 Tooltip

**Base class:** `aiux-tooltip`

**Positions:** `aiux-tooltip-top`, `aiux-tooltip-bottom`, `aiux-tooltip-left`, `aiux-tooltip-right`.

**Behavior:** instant show/hide, no custom animation, no inline `boxShadow`. Use `shadow-lg` / `shadow-xl`.

### 3.12 Badge

**Base class:** `aiux-badge`

**Color variants:** `aiux-badge-primary`, `aiux-badge-secondary`, `aiux-badge-accent`, `aiux-badge-info`, `aiux-badge-success`, `aiux-badge-warning`, `aiux-badge-error`, `aiux-badge-neutral`, `aiux-badge-ghost`.

**Style variants:** `aiux-badge-outline`, `aiux-badge-soft`, `aiux-badge-dash`.

**Sizes:** `aiux-badge-xs`, `aiux-badge-sm`, `aiux-badge-md`, `aiux-badge-lg`, `aiux-badge-xl`.

**Rules:**
- **Never use solid `aiux-badge-primary` for counts.** Use `aiux-badge-outline` instead.
- `aiux-badge-soft` is acceptable at `xs` for subtle inline labels.
- Active tab count: `aiux-badge-primary aiux-badge-outline aiux-badge-xs`.
- Inactive tab count: `aiux-badge-ghost aiux-badge-xs`.
- Live status: `aiux-badge-success aiux-badge-soft aiux-badge-xs`.

### 3.13 Pill

**Base class:** `aiux-pill`

**Color variants:** same as badge.
**Style variants:** `aiux-pill-outline`, `aiux-pill-soft`, `aiux-pill-dash`.
**Sizes:** `aiux-pill-xs`, `aiux-pill-sm`, `aiux-pill-md`, `aiux-pill-lg`, `aiux-pill-xl`.

**Visual signature:** rounded-full chip, often with close icon.

**Common combos:**
- Status pill connected: `aiux-pill-success aiux-pill-outline aiux-pill-sm rounded-full`.
- Status pill reconnect: `aiux-pill-warning aiux-pill-outline aiux-pill-sm rounded-full`.
- Status pill connect: `aiux-pill-primary aiux-pill-outline aiux-pill-sm rounded-full`.

### 3.14 Avatar

**Base class:** `aiux-avatar`

**Visual signature:** circle with image, initials, or icon.

**Props/classes:**
- `aiux-avatar-online` / `aiux-avatar-offline` — status dot
- `aiux-avatar-placeholder` — letters placeholder
- Sizes: `w-8 h-8`, `w-10 h-10`, `w-12 h-12`, or `aiux-avatar-xs` etc.

**Rules:**
- Always use `aiux-avatar` for profile images.
- Status dots use `aiux-avatar-online`, `aiux-avatar-offline`, `aiux-avatar-available`, `aiux-avatar-away`, `aiux-avatar-busy`.

### 3.15 Card

**Base class:** `aiux-card`

**Visual signature:** rectangle with optional header, title, subtitle, body, actions, footer.

**Sub-elements:**
- `aiux-card-body`
- `aiux-card-title`
- `aiux-card-actions`

**Common combos:**
- Default card: `aiux-card bg-base-100 shadow-sm border border-base-300`.
- Hover card: `aiux-card bg-base-100 shadow-sm border border-base-300 hover:shadow-md hover:-translate-y-1 cursor-pointer`.
- Settings card: `aiux-card bg-base-100 shadow-sm border border-base-300` + `aiux-card-body p-5`.

**Rules:**
- All cards must have `border border-base-300` for visible edges.

### 3.16 Collapse / Accordion

**Base classes:** `aiux-collapse`, `aiux-accordion`

**Sub-elements:** `aiux-collapse-title`, `aiux-collapse-content`.

**Modifiers:** `aiux-collapse-arrow`, `aiux-collapse-plus`, `aiux-collapse-open`.

### 3.17 Link

**Base class:** `aiux-link`

**Modifiers:** `aiux-link-primary`, `aiux-link-secondary`, `aiux-link-accent`, `aiux-link-info`, `aiux-link-success`, `aiux-link-warning`, `aiux-link-error`, `aiux-link-neutral`.

### 3.18 Breadcrumbs

**Base class:** `aiux-breadcrumbs`

**Item:** `aiux-breadcrumb`

**Visual signature:** horizontal list of links separated by chevron (`>`).

### 3.19 Dropdown

**Base class:** `aiux-dropdown`

**Trigger:** `aiux-btn` with `aiux-dropdown` wrapper.
**Menu:** `aiux-dropdown-content`.
**Item:** `aiux-dropdown-item`.

**Common combo:**
```
aiux-dropdown
  aiux-btn aiux-btn-ghost aiux-btn-sm
  aiux-dropdown-content aiux-menu p-2 shadow-xl border border-base-300
    aiux-dropdown-item
```

### 3.20 Menu

**Base class:** `aiux-menu`

**Item:** `aiux-menu-item`
**Title:** `aiux-menu-title`
**Active:** `aiux-menu-active`
**Disabled:** `aiux-menu-disabled`

**Sizes:** `aiux-menu-xs`, `aiux-menu-sm`, `aiux-menu-md`, `aiux-menu-lg`, `aiux-menu-xl`.

**Visual signature:** vertical list of clickable rows, often with hover background.

### 3.21 Tabs

**Base class:** `aiux-tabs`

**Variants:** `aiux-tabs-boxed`, `aiux-tabs-bordered`, `aiux-tabs-lift`.

**Tab:** `aiux-tab`.
**Active:** `aiux-tab-active`.
**Disabled:** `aiux-tab-disabled`.

**Sizes:** `aiux-tabs-xs`, `aiux-tabs-sm`, `aiux-tabs-md`, `aiux-tabs-lg`, `aiux-tabs-xl`.

**Rules:**
- Gallery/landing nav: `aiux-tabs-boxed`.
- Settings nav: `aiux-tabs-bordered`.

### 3.22 Table

**Base class:** `aiux-table`

**Modifiers:** `aiux-table-zebra`, `aiux-table-pin-rows`, `aiux-table-pin-cols`, `aiux-table-xs`, `aiux-table-sm`, `aiux-table-md`, `aiux-table-lg`, `aiux-table-xl`.

### 3.23 Steps

**Base class:** `aiux-steps`

**Item:** `aiux-step`
**Active:** `aiux-step-active`
**Error:** `aiux-step-error`

### 3.24 Timeline

**Base class:** `aiux-timeline`

**Item:** `aiux-timeline-item`
**Start/End:** `aiux-timeline-start`, `aiux-timeline-end`
**Middle:** `aiux-timeline-middle`

### 3.25 Divider

**Base class:** `aiux-divider`

**Modifiers:** `aiux-divider-vertical`, `aiux-divider-horizontal`, `aiux-divider-neutral`, `aiux-divider-primary`, etc.

### 3.26 Indicator

**Base class:** `aiux-indicator`

**Item:** `aiux-indicator-item`

### 3.27 Join

**Base class:** `aiux-join`

**Modifier:** `aiux-join-vertical`.

### 3.28 Pagination

**Base class:** `aiux-pagination`

**Item:** `aiux-join` + `aiux-btn`.

### 3.29 Skeleton

**Base classes:**
- `aiux-skeleton` — default shimmer
- `aiux-skeleton-text` — text variant
- `aiux-skeleton-primary` — primary-tinted
- `aiux-skeleton-pulse` — pulse animation

**Shape helpers:**
- `aiux-skeleton-list`
- `aiux-skeleton-title`
- `aiux-skeleton-item`
- `aiux-skeleton-circle`
- `aiux-skeleton-card`

**Reveal pattern:**
- Wrap real content + skeleton in `aiux-skeleton-reveal`.
- Add `is-loaded` when data is ready.
- Use `aiux-skeleton-reveal__placeholder` and `aiux-skeleton-reveal__content`.

---

## 4. Token Map

These tokens come from `tailwind.css` and DaisyUI. Do not invent new ones.

### 4.1 Colors

| Token | CSS variable | Usage |
| --- | --- | --- |
| Primary | `--color-primary` | CTAs, active states, focus rings |
| Secondary | `--color-secondary` | Secondary actions |
| Accent | `--color-accent` | Highlights |
| Neutral | `--color-neutral` | Neutrals, disabled |
| Info | `--color-info` | Informational |
| Success | `--color-success` | Success states |
| Warning | `--color-warning` | Warnings |
| Error | `--color-error` | Errors, destructive |
| Base background | `--color-base-100` | Card / surface background |
| Subtle background | `--color-base-200` | Page / section background |
| Border background | `--color-base-300` | Borders, dividers |
| Base content | `--color-base-content` | Primary text |
| Secondary content | `--color-base-content-secondary` | Secondary text |
| Tertiary content | `--color-base-content-tertiary` | Disabled / placeholder |

**Color opacity:** use `text-base-content/50`, `text-base-content/40`, `text-base-content/30`, etc.

### 4.2 Spacing

| Token | Usage |
| --- | --- |
| `--spacing` | Base spacing unit |
| `--spacing-1` | 4px |
| `--spacing-2` | 8px |
| `--spacing-3` | 12px |
| `--spacing-4` | 16px |
| `--spacing-5` | 20px |
| `--spacing-6` | 24px |
| `--spacing-8` | 32px |
| `--spacing-10` | 40px |
| `--spacing-12` | 48px |
| `--spacing-16` | 64px |
| `--spacing-20` | 80px |
| `--spacing-24` | 96px |
| `--spacing-32` | 128px |
| `--spacing-40` | 160px |
| `--spacing-48` | 192px |
| `--spacing-56` | 224px |

### 4.3 Typography

| Token | Size | Usage |
| --- | --- | --- |
| `--text-xs` | 12px | Captions, small labels |
| `--text-sm` | 14px | Body small, metadata |
| `--text-base` | 16px | Body |
| `--text-lg` | 18px | Subheadings |
| `--text-xl` | 20px | Headings |
| `--text-2xl` | 24px | Large headings |
| `--text-3xl` | 30px | Hero |
| `--text-4xl` | 36px | Display |
| `--text-5xl` | 48px | Display |
| `--text-6xl` | 60px | Display |
| `--text-7xl` | 72px | Display |
| `--font-weight-normal` | 400 | Body |
| `--font-weight-medium` | 500 | Emphasis |
| `--font-weight-semibold` | 600 | Labels, headings |
| `--font-weight-bold` | 700 | Strong emphasis |

### 4.4 Border radius

| Token | Value |
| --- | --- |
| `--radius-none` | 0 |
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 24px |
| `--radius-full` | 9999px |

### 4.5 Shadows

| Class | Usage |
| --- | --- |
| `shadow-sm` | Cards |
| `shadow-md` | Hover cards |
| `shadow-lg` | Tooltips (compact) |
| `shadow-xl` | Dropdowns, modals, tooltips (default) |

**Rule:** Never use inline `boxShadow` with `rgba(...)`. Use Tailwind shadow classes.

### 4.6 Motion

| Token | Usage |
| --- | --- |
| `--motion-duration` | Default transition duration |
| `--motion-duration-fast` | Fast transitions |
| `--motion-duration-normal` | Normal transitions |
| `--motion-duration-slow` | Slow transitions |
| `--motion-ease` | Default easing |
| `--motion-ease-in` | Ease in |
| `--motion-ease-out` | Ease out |
| `--motion-ease-in-out` | Ease in-out |
| `--motion-bounce` | Bounce |
| `--motion-fade` | Fade |
| `--motion-scale` | Scale |
| `--motion-slide` | Slide |
| `--motion-spin` | Spin |
| `--motion-pulse` | Pulse |
| `--motion-bounce` | Bounce |

### 4.7 Z-index

| Token | Value |
| --- | --- |
| `--z-base` | 0 |
| `--z-dropdown` | 1000 |
| `--z-sticky` | 1020 |
| `--z-fixed` | 1030 |
| `--z-modal-backdrop` | 1040 |
| `--z-modal` | 1050 |
| `--z-popover` | 1060 |
| `--z-tooltip` | 1070 |

---

## 5. Layout Vocabulary

Use these Tailwind utilities for structural layout.

### 5.1 Display

| Class | Behavior |
| --- | --- |
| `flex` | Flex container |
| `inline-flex` | Inline flex container |
| `grid` | Grid container |
| `inline-grid` | Inline grid |
| `block` | Block |
| `inline-block` | Inline block |
| `hidden` | Hidden |
| `contents` | Contents display |

### 5.2 Flex direction

| Class | Behavior |
| --- | --- |
| `flex-row` | Horizontal |
| `flex-row-reverse` | Horizontal reversed |
| `flex-col` | Vertical |
| `flex-col-reverse` | Vertical reversed |

### 5.3 Flex alignment

| Class | Behavior |
| --- | --- |
| `items-start` | Align top |
| `items-center` | Align center vertically |
| `items-end` | Align bottom |
| `items-stretch` | Stretch |
| `justify-start` | Left align |
| `justify-center` | Center horizontally |
| `justify-end` | Right align |
| `justify-between` | Space between |
| `justify-around` | Space around |
| `justify-evenly` | Space evenly |

### 5.4 Spacing helpers

| Class | Value |
| --- | --- |
| `gap-1` | 4px |
| `gap-2` | 8px |
| `gap-3` | 12px |
| `gap-4` | 16px |
| `gap-5` | 20px |
| `gap-6` | 24px |
| `gap-8` | 32px |
| `p-1` | 4px padding |
| `p-2` | 8px |
| `p-3` | 12px |
| `p-4` | 16px |
| `p-5` | 20px |
| `m-1` | 4px margin |
| `m-2` | 8px |
| `m-3` | 12px |
| `m-4` | 16px |

### 5.5 Sizing

| Class | Width |
| --- | --- |
| `w-full` | 100% |
| `w-screen` | 100vw |
| `w-fit` | fit-content |
| `w-auto` | auto |
| `min-w-0` | 0 min-width |
| `max-w-full` | 100% max |
| `h-full` | 100% height |
| `h-screen` | 100vh |
| `h-fit` | fit-content |
| `h-auto` | auto |

### 5.6 Grid helpers

| Class | Behavior |
| --- | --- |
| `grid-cols-1` | 1 column |
| `grid-cols-2` | 2 columns |
| `grid-cols-3` | 3 columns |
| `grid-cols-4` | 4 columns |
| `grid-cols-5` | 5 columns |
| `grid-cols-6` | 6 columns |
| `grid-cols-12` | 12 columns |
| `col-span-1` … `col-span-12` | Span columns |
| `col-start-1` … `col-start-13` | Start column |
| `col-end-1` … `col-end-13` | End column |
| `grid-rows-1` … | Row counts |
| `row-span-1` … | Row span |
| `gap-x-*` | Horizontal gap |
| `gap-y-*` | Vertical gap |

### 5.7 Borders

| Class | Usage |
| --- | --- |
| `border` | 1px border |
| `border-0` | No border |
| `border-b` | Bottom border |
| `border-t` | Top border |
| `border-l` | Left border |
| `border-r` | Right border |
| `border-base-200` | Subtle border |
| `border-base-300` | Strong border |
| `border-transparent` | Transparent border |
| `rounded-sm` | 4px radius |
| `rounded-md` | 8px |
| `rounded-lg` | 12px |
| `rounded-xl` | 16px |
| `rounded-full` | Full radius |
| `rounded-none` | No radius |

### 5.8 Typography utilities

| Class | Usage |
| --- | --- |
| `text-xs` | Extra small text |
| `text-sm` | Small text |
| `text-base` | Base text |
| `text-lg` | Large text |
| `text-xl` | Extra large |
| `font-normal` | 400 weight |
| `font-medium` | 500 weight |
| `font-semibold` | 600 weight |
| `font-bold` | 700 weight |
| `uppercase` | Uppercase text |
| `lowercase` | Lowercase text |
| `capitalize` | Capitalized |
| `tracking-wide` | Wide letter spacing |
| `leading-none` | Line height 1 |
| `leading-tight` | Tight line height |
| `leading-normal` | Normal line height |
| `leading-relaxed` | Relaxed line height |
| `line-clamp-1` | 1-line clamp |
| `line-clamp-2` | 2-line clamp |
| `line-clamp-3` | 3-line clamp |

### 5.9 Background / text color utilities

| Class | Usage |
| --- | --- |
| `bg-base-100` | Surface background |
| `bg-base-200` | Page background |
| `bg-base-300` | Subtle background |
| `bg-primary` | Primary background |
| `bg-neutral` | Neutral background |
| `bg-error` | Error background |
| `text-base-content` | Primary text |
| `text-base-content/50` | Secondary text |
| `text-base-content/30` | Tertiary text |
| `text-primary` | Primary text |
| `text-secondary` | Secondary text |
| `text-error` | Error text |
| `text-success` | Success text |

### 5.10 Interactive states

| Class | Usage |
| --- | --- |
| `hover:bg-base-200` | Hover background |
| `hover:shadow-md` | Hover shadow |
| `hover:-translate-y-1` | Hover lift |
| `focus:outline-none` | Remove focus outline |
| `focus:ring-2` | Focus ring |
| `focus:ring-primary` | Primary focus ring |
| `active:scale-95` | Active press |
| `cursor-pointer` | Pointer cursor |
| `cursor-default` | Default cursor |
| `cursor-not-allowed` | Not allowed cursor |

---

## 6. Common UI Patterns

### 6.1 Header / navigation bar

```
<header class="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
  <div class="flex items-center gap-3">
    <sn-aix-icon name="home-outline" size="md"></sn-aix-icon>
    <h1 class="text-base font-semibold text-base-content">Title</h1>
  </div>
  <div class="flex items-center gap-2">
    <button class="aiux-btn aiux-btn-ghost aiux-btn-xs aiux-btn-square">
      <sn-aix-icon name="gear-outline" size="sm"></sn-aix-icon>
    </button>
    <button class="aiux-btn aiux-btn-primary aiux-btn-sm">Primary</button>
  </div>
</header>
```

### 6.2 Card list item

```
<div class="aiux-card bg-base-100 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer">
  <div class="aiux-card-body p-4 flex items-center gap-3">
    <div class="aiux-avatar">
      <img src="..." />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-sm font-semibold text-base-content">Title</h3>
      <p class="text-xs text-base-content/50">Description</p>
    </div>
    <sn-aix-icon name="chevron-right-outline" size="sm"></sn-aix-icon>
  </div>
</div>
```

### 6.3 Form row

```
<div class="flex flex-col gap-1.5">
  <label class="aiux-label text-sm font-medium text-base-content">Label</label>
  <input class="aiux-input aiux-input-bordered aiux-input-sm" placeholder="Placeholder" />
  <p class="text-xs text-base-content/50">Hint text</p>
</div>
```

### 6.4 Status badge

```
<span class="aiux-badge aiux-badge-success aiux-badge-soft aiux-badge-xs">Live</span>
<span class="aiux-pill aiux-pill-primary aiux-pill-outline aiux-pill-sm rounded-full">Connected</span>
```

### 6.5 Empty state

```
<div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
  <sn-aix-icon name="box-outline" size="xl" class="text-base-content/30"></sn-aix-icon>
  <h3 class="text-base font-semibold text-base-content">No items</h3>
  <p class="text-sm text-base-content/50">Get started by adding one.</p>
  <button class="aiux-btn aiux-btn-primary aiux-btn-sm">Add item</button>
</div>
```

---

## 7. Deterministic Mapping Rules

When analyzing a screenshot, apply these rules in order:

1. **Identify the primary visual category:** interactive, feedback, data display, layout, loading.
2. **Match the shape and content:** use Section 2 decision tree.
3. **Determine the component:** use the exact `aiux-*` base class from Section 3.
4. **Determine color and variant:** match the visual color to the closest semantic token (primary, secondary, success, warning, error, neutral, ghost).
5. **Determine size:** compare to known sizes (xs, sm, md, lg, xl).
6. **Determine state:** active, disabled, loading, hover, focus, checked, open.
7. **Determine layout context:** use Tailwind classes from Section 5 for spacing, alignment, and sizing.
8. **Verify with MCP only if ambiguous:** call `search_components` or `get_component` if the visual element does not match any signature above, or if the exact prop name is uncertain.

---

## 8. Anti-patterns

- **Do not hardcode hex colors.** Use `bg-base-*`, `text-base-content`, `border-base-*`, or DaisyUI color tokens.
- **Do not use inline styles** for layout, spacing, or color. Use Tailwind classes.
- **Do not use `variant="soft"` for buttons on light backgrounds.** Use `outline` or solid.
- **Do not use solid `badge-primary` for counts.** Use `outline`.
- **Do not use `<Divider>` component.** Use `border-b` / `border-t` directly.
- **Do not use filled icon variants.** Always append `-outline` to `sn-aix-icon` names.
- **Do not use raw `<button>` inside dropdowns.** Use `aiux-btn`.
- **Do not use custom skeleton divs.** Use `aiux-skeleton` + shape helpers.

---

## 9. Reference

- Source file: `karuna/components/core/src/styles/tailwind.css`
- Agent: `karuna/components/core/src/styles/agent.md`
- Icon library: `aiux-kit/src/client/assets/icons/`
- Component base class: `AIUXWidgetElement` (do not extend `LitElement` directly)
