---
name: Apex Enterprise System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#003d28'
  on-tertiary: '#ffffff'
  tertiary-container: '#00563a'
  on-tertiary-container: '#5bcf9e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  mono-data:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system delivers a high-density, authoritative visual language calibrated for mission-critical enterprise resource planning (ERP), financial operations, and complex supply-chain infrastructure. The aesthetic is strictly Corporate Modern with architectural precision: deliberate contrast, structural grid discipline, and zero gratuitous ornamentation. 

The target audience comprises operations directors, data analysts, enterprise controllers, and supply chain managers who spend 8+ hours a day inside dense information views. The UI evokes absolute stability, executive clarity, operational competence, and institutional trust. Interfaces prioritize scannability, predictable spatial layouts, and immediate visual hierarchy under heavy analytical loads.

## Colors

The color palette uses high-contrast functional zoning to preserve signal fidelity across data-dense views:

- **Primary (`#1E40AF`):** Deep Royal Navy anchors key actions, active navigation states, interactive rows, and primary structural accents. A supporting interactive hover state maps to `#2563EB`.
- **Secondary (`#0F172A`):** Deep Slate 900 powers core typography, high-contrast headings, app shells, and sidebar rails.
- **Tertiary & Semantics:**
  - **Success / Validated (`#059669` / `#10B981`):** Applied to paid balances, inbound inventory surpluses, and completed batched workflows.
  - **Warning / Pending (`#D97706` / `#F59E0B`):** Applied to aging receivables, low stock thresholds, and awaiting approvals.
  - **Critical / Deficit (`#DC2626`):** Applied to stock outages, ledger reconciliations, system errors, and risk triggers.
- **Neutrals (`Slate 50–900`):** Surfaces rely on `#F8FAFC` (Canvas background), `#FFFFFF` (Surface cards/tables), `#E2E8F0` (Structural interior rules), and `#64748B` (Subordinate metadata).

## Typography

Inter is implemented across all typographic hierarchy tiers to provide uniform legibility in high-density multi-pane views. 

- **Numerical & Financial Tabulation:** Tabular figures (`tnum`, `zero`) must be forced on all data table cells, KPI values, currency balances, and ledger quantities to ensure strict vertical column alignment across thousands of financial rows.
- **Hierarchy Rules:** Display and headline levels emphasize structural module identification. Labels (`label-md`, `label-sm`) default to uppercase with micro-tracked letter spacing for column headers, metric legends, and status pills.
- **Scale Optimization:** Body typography is adjusted to a tight 13px base (`body-md`) to optimize screen real estate for dense multi-column ERP tables, while preserving high legibility with 18px line height.

## Layout & Spacing

The layout model is built on an enterprise-grade 12-column adaptive fluid grid with a permanent left-rail application taxonomy:

- **Desktop (1280px+):** Primary shell consists of a 240px collapsable navigation rail, 1.5rem page margins, and 1rem column gutters. Standard multi-card layouts use 3 or 4-column spans; high-density ledger workspaces switch to full-width dynamic container frames with internal 0.5rem gutters.
- **Tablet / Responsive Laptops (768px - 1279px):** Navigation rail collapses to an icon-only 64px docked state. Grid margins scale down to 1rem. Complex tabular views enable horizontal freeze-column scrolling for identifiers and totals.
- **Mobile (< 768px):** Navigation tucks into an off-canvas drawer. KPI tiles drop to a 2x2 or 1-column stack. Tables reflow into stacked key-value modular cards.
- **Rhythm Discipline:** Component internal padding adheres to an absolute 4px/8px sub-grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px, `space-lg` = 16px). Form controls and data rows maintain consistent 32px to 36px compact heights.

## Elevation & Depth

Visual separation relies primarily on crisp structural line boundaries, tonal surface separation, and restrained, micro-blur elevation tiers:

- **Canvas vs. Container Hierarchy:** The application background resides at `#F8FAFC`. Active cards, panels, and data grids sit on `#FFFFFF` bordered with a 1px solid rule (`#E2E8F0`). Secondary nested sections use `#F1F5F9`.
- **Shadow Tokens:**
  - **Resting Flat (Tier 0):** `0 0 0 1px #E2E8F0` (Default modular cards, KPI tiles, data grids).
  - **Elevated / Popover (Tier 1):** `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)` surrounded by a 1px `#CBD5E1` boundary (Toolbars, active dropdown menus, contextual filters).
  - **Floating Modal / Flyout (Tier 2):** `0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)` (Transaction confirmation drawers, ledger detail modals).

## Shapes

The shape system is strictly conservative (`roundedness: 1`), reinforcing precision, clean edge alignment, and minimal pixel waste:

- **Default Element Radius (`0.25rem` / 4px):** Applied to form inputs, buttons, segmented controls, table row hover states, and standard modular cards.
- **Large Radius (`0.5rem` / 8px):** Reserved for primary outer layout containers, dashboard panels, and full modal frames.
- **Pill Shape (`9999px`):** Strictly restricted to small status pills, inventory badge indicators, and operational alert markers to immediately differentiate metadata from interactive rectangular controls.

## Components

### Buttons
- **Primary:** Background `#1E40AF`, text `#FFFFFF`, border none, 4px border radius. Height 32px (compact) or 36px (standard). Padding 0.75rem. Hover `#2563EB`. Active `#1D4ED8`.
- **Secondary / Outline:** Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`. Hover background `#F8FAFC`, border `#94A3B8`.
- **Destructive:** Background `#DC2626`, text `#FFFFFF`. Hover `#B91C1C`.

### Data Tables
- **Container:** Border 1px solid `#E2E8F0`, border-radius 4px, background `#FFFFFF`.
- **Header Cells:** Height 36px, background `#F8FAFC`, border-bottom 1px solid `#CBD5E1`, text `label-sm` (`#475569`), uppercase tracking, sort icons positioned right.
- **Body Rows:** Height 36px (dense) or 44px (default). Border-bottom 1px solid `#F1F5F9`. Hover background `#F8FAFC`. Selected background `#EFF6FF` with a 2px `#1E40AF` left-indicator stroke.
- **Numeric Alignment:** Right-aligned columns with tabular monospace styling.

### KPI Stat Cards
- Single-cell card containing: 11px uppercase label (`#64748B`), 24px bold metric (`#0F172A`), inline badge pill showing period variance (`+4.2%` with `#059669` text on `#ECFDF5` fill, or `-1.8%` with `#DC2626` text on `#FEF2F2` fill). Micro sparklines render in primary navy.

### Badge Pills
- Height 20px, border-radius 9999px, padding 0 8px, typography `label-sm`.
- **Paid / Complete:** `#ECFDF5` background, `#047857` text, 1px solid `#A7F3D0`.
- **Warning / Low Stock:** `#FFFBEB` background, `#B45309` text, 1px solid `#FDE68A`.
- **Critical / Deficit:** `#FEF2F2` background, `#B91C1C` text, 1px solid `#FECACA`.
- **Draft / Inactive:** `#F1F5F9` background, `#475569` text, 1px solid `#E2E8F0`.

### Form Inputs & Filter Toolbars
- **Input Fields:** Height 32px or 36px, border 1px solid `#CBD5E1`, background `#FFFFFF`, typography `body-md`. Focus ring: 2px offset-free outline in `#1E40AF` with border color `#1E40AF`.
- **Filter Toolbar:** Horizontal container resting above data tables with flex-wrap alignment, housing consolidated search with icon prefix, segmented view-switchers, and quick-filter pills with dismiss buttons.

### Multi-Module Navigation Taxonomy
- Docked sidebar rail with primary module categories (General Ledger, Inventory, Accounts Payable, Supply Chain, Human Capital). 
- Active module has a subtle `#1E40AF` left accent border, `#1E40AF` text, and `#F1F5F9` row fill. Expandable tree-view submenus render with 12px indented connectors.