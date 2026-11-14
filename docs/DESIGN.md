# TiffinMate design system

Light-first, warm and food-forward. All tokens live in `src/index.css`; dark mode is the `.dark` class (toggled by `ThemeContext`).
The `stone` and `orange` Tailwind scales are remapped, so `text-stone-600`, `bg-stone-50`, `bg-orange-600` etc. are already on-palette.

## Palette

| Role | Class | Hex |
| --- | --- | --- |
| Page background (cream) | `bg-stone-50` | #FFF8F0 |
| Text | `text-stone-900` / `.muted` | #2B2019 / #5F4D3B |
| Primary (saffron) | `bg-orange-600` (hover `-700`) | #D9480F |
| Primary tint | `bg-orange-50` / `-100` | #FFF3E6 / #FFE8D2 |
| Veg / secondary (leaf) | `bg-green-700`, tint `bg-green-100` | #237A35 |
| Highlight (turmeric) | `bg-turmeric-100`, `bg-turmeric-400` | #FFF1BF / #F9C22E |
| Non-veg | `badge-nonveg` (red) | |
| Dark surfaces | `dark:bg-stone-950` page, `dark:bg-stone-900` cards | |

## Type scale

- Headings: `font-display` (Fraunces). Page title `page-title`, section title `section-title`, card title `font-display text-xl font-semibold`.
- Body: Inter. Default `text-base`, secondary `text-sm muted`, labels `text-xs`, small caps `eyebrow`.

## Spacing

Pages sit in `<main class="max-w-6xl px-4 sm:px-6">`. Page content: `py-10`. Between sections: `section` (3.5rem, 5rem on sm+). Inside a card: `p-6` (use `p-5` for dense cards). Grid gaps: `gap-4` (dense), `gap-6` (default). Radius: `--radius-card` (cards), `rounded-full` (buttons, badges, chips), `rounded-xl` (inputs).

## Utilities

`btn-primary`, `btn-secondary` (green), `btn-ghost`, `card`, `card-hover`, `input`, `label`, `badge`, `badge-brand`, `badge-veg`, `badge-nonveg`, `badge-warn`, `chip`, `section`, `section-title`, `page-title`, `muted`, `eyebrow`, `skeleton`.

## Recipes

**Page header**
```jsx
<header className="mb-8">
  <p className="eyebrow">Billing</p>
  <h1 className="page-title mt-1">Your invoices</h1>
  <p className="muted mt-2">Everything you have paid so far.</p>
</header>
```

**Stat card**
```jsx
<div className="card p-5">
  <p className="text-sm muted">Active subscribers</p>
  <p className="mt-1 font-display text-3xl font-bold">128</p>
  <span className="badge-veg mt-2">+12 this week</span>
</div>
```

**Table card** (scrolls sideways on phones)
```jsx
<div className="card overflow-x-auto p-0">
  <table className="w-full min-w-[32rem] text-left text-sm">
    <thead className="bg-stone-100 dark:bg-stone-800/50"><tr><th className="px-4 py-3 font-semibold">Plan</th></tr></thead>
    <tbody><tr className="border-t border-stone-100 dark:border-stone-800"><td className="px-4 py-3">Ghar Ka Khana</td></tr></tbody>
  </table>
</div>
```

**Tab bar / filter** (`aria-selected` for tabs, `aria-pressed` for toggles; the `chip` utility styles the active state)
```jsx
<div role="tablist" className="flex gap-2 overflow-x-auto">
  {tabs.map((t) => <button key={t} role="tab" aria-selected={t === active} onClick={() => setActive(t)} className="chip">{t}</button>)}
</div>
```

**Empty state**
```jsx
<div className="card py-12 text-center">
  <p className="text-5xl" aria-hidden="true">🍽️</p>
  <h2 className="mt-3 font-display text-xl font-semibold">Nothing here yet</h2>
  <p className="muted mt-1 text-sm">Subscribe to a plan to see your tiffins.</p>
  <a href="/plans" className="btn-primary mt-5">Browse plans</a>
</div>
```

**Loading**: `<SkeletonGrid count={3} />` from `components/PlanCard.jsx`, or any block with `skeleton h-32`.
