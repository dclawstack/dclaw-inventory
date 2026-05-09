# DKube Design System

> Source file: [[../colors_and_type.css]]
> Applied to: all frontend components in `frontend/src/`

## Brand Identity

- **Brand:** DKube (`dkube.io`)
- **Primary color:** Purple — `#7660A8` (`--dk-purple-700`, logo dark face)
- **Secondary:** `#9384BD` (`--dk-purple-500`, logo light face)
- **Font:** Poppins (all weights 300–800, locally bundled in `/fonts/`)
- **Mood:** Clean enterprise, warm-white ground, purple authority

## Color Palette

### Brand Purple Scale
| Token | Hex | Use |
|---|---|---|
| `--dk-purple-900` | `#4A3878` | Hover/press states |
| `--dk-purple-700` | `#7660A8` | **Primary** — buttons, links, active nav |
| `--dk-purple-500` | `#9384BD` | **Secondary** — subtle accents |
| `--dk-purple-100` | `#F1EEF8` | Soft badge backgrounds |
| `--dk-purple-50` | `#F8F6FB` | Page tint wash |

### Neutrals
| Token | Hex | Use |
|---|---|---|
| `--dk-ink` | `#0F0F12` | Headlines |
| `--dk-gray-700` | `#404049` | Body copy |
| `--dk-gray-500` | `#7A7A85` | Meta / secondary text |
| `--dk-gray-300` | `#D6D6D6` | Strong borders, dividers |
| `--dk-gray-200` | `#E8E8EC` | Default borders |
| `--dk-gray-50` | `#F8F8FA` | Page background |

### Status Colors
| State | Text | Background |
|---|---|---|
| Success / In Stock | `--dk-success` `#2E8B57` | `--dk-success-bg` `#E6F4EC` |
| Warning / Low Stock | `--dk-warning` `#C28A00` | `--dk-warning-bg` `#FBF1DC` |
| Danger / Out of Stock | `--dk-danger` `#B3261E` | `--dk-danger-bg` `#FBE9E7` |
| Info | `--dk-info` `#2C6CB0` | `--dk-info-bg` `#E5EFF9` |

## Typography

**Font stack:** `'Poppins', system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

| Class | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `.dk-eyebrow` | 14px | 600 | — | Section labels, uppercase tags |
| `.dk-h1` | clamp(48–96px) | 700 | 1.05 | Hero (marketing only) |
| `.dk-h2` | clamp(32–56px) | 700 | 1.15 | Marketing section titles |
| `.dk-h3` | 32px | 700 | 1.15 | **App page titles** |
| `.dk-h4` | 24px | 600 | 1.15 | **Card / section headers** |
| `.dk-h5` | 20px | 600 | 1.15 | **Sub-section headers** |
| `.dk-lead` | 18px | 400 | 1.65 | Intro / summary paragraphs |
| `.dk-body` | 16px | 400 | 1.65 | **Default body text** |
| `.dk-meta` | 14px | 500 | 1.5 | **Table cells, form labels** |
| `.dk-caption` | 12px | 500 | 1.5 | **Timestamps, helper text** |

## Spacing (4px base grid)

`4 → 8 → 12 → 16 → 20 → 24 → 32 → 40 → 48 → 64 → 80 → 96 → 128px`

## Radii

| Token | Value | Use |
|---|---|---|
| `--dk-radius-xs` | 4px | Inline code, tiny badges |
| `--dk-radius-sm` | 8px | Inputs, small badges, chips |
| `--dk-radius-md` | 12px | Dropdowns, tooltips |
| `--dk-radius-lg` | 16px | **Cards, panels** |
| `--dk-radius-xl` | 24px | Large feature cards |
| `--dk-radius-pill` | 999px | **CTA buttons** |

## Elevation

| Token | Shadow | Use |
|---|---|---|
| `--dk-shadow-xs` | `0 1px 2px rgba(15,15,18,0.04)` | Subtle lift |
| `--dk-shadow-sm` | `0 2px 6px rgba(15,15,18,0.06)` | **Resting cards** |
| `--dk-shadow-md` | `0 8px 20px rgba(15,15,18,0.08)` | **Hover-lift on cards** |
| `--dk-shadow-brand` | `0 12px 28px rgba(118,96,168,0.28)` | Primary button glow |

## Motion

| Token | Value | Use |
|---|---|---|
| `--dk-dur-fast` | 150ms | Hover color changes |
| `--dk-dur-base` | 240ms | Card lifts, reveals |
| `--dk-dur-slow` | 420ms | Page transitions |
| `--dk-ease-out` | `cubic-bezier(0.22,1,0.36,1)` | Entrances |
| `--dk-ease-in-out` | `cubic-bezier(0.65,0,0.35,1)` | Transitions |
