# Responsive Transaction List - UI Mockup Guide

## 🎨 Actual Rendered UI Examples

### Mobile Phone (iPhone 12 - 390×844px)

```
┌──────────────────────────────────┐
│ Dashboard                        │
│                                  │
│ Transactions in May 2026    [5]  │
│ ──────────────────────────────── │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [F]                       ✏️ │ │
│ │ Fuel                      🗑 │ │
│ │ 05/15/2024           − $45   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [G]                       ✏️ │ │
│ │ Groceries                 🗑 │ │
│ │ 05/14/2024           − $62   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [R]                       ✏️ │ │
│ │ Restaurant                🗑 │ │
│ │ 05/12/2024           − $38   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [U]                       ✏️ │ │
│ │ Utilities                 🗑 │ │
│ │ 05/10/2024          − $120   │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [S]                       ✏️ │ │
│ │ Salary                    🗑 │ │
│ │ 05/01/2024        + $3,500   │ │
│ └──────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

**Features Visible:**

- Card layout (no table)
- Full width cards
- Category badge with first letter
- Dark text for expenses
- Green text for income
- Emoji action buttons (hidden initially)
- No horizontal scroll

### Tablet (iPad - 768×1024px)

```
┌─────────────────────────────────────────────────┐
│ Dashboard                                       │
│                                                 │
│ Transactions in May 2026                    [5]│
│ ──────────────────────────────────────────────  │
│                                                 │
│  Date     Category        Type      Amount  Act │
│ ───────────────────────────────────────────────  │
│  05/15    Fuel           expense  − $45   Edit │
│                                        Delete  │
│ ───────────────────────────────────────────────  │
│  05/14    Groceries      expense  − $62   Edit │
│                                        Delete  │
│ ───────────────────────────────────────────────  │
│  05/12    Restaurant     expense  − $38   Edit │
│                                        Delete  │
│ ───────────────────────────────────────────────  │
│  05/10    Utilities      expense − $120   Edit │
│                                        Delete  │
│ ───────────────────────────────────────────────  │
│  05/01    Salary         income   + $3,500 Edit│
│                                        Delete  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Features Visible:**

- Table layout (not cards)
- 5 columns visible
- Type badge (expense/income)
- Text-only actions
- Light borders between rows
- Amount right-aligned

### Desktop (1440×900px)

```
┌──────────────────────────────────────────────────────────────────┐
│ Dashboard                                                         │
│                                                                   │
│ Transactions in May 2026                                   [5]    │
│ ────────────────────────────────────────────────────────────────  │
│                                                                   │
│  Date      │ Category    │ Type     │ Amount        │ Actions    │
│ ────────────────────────────────────────────────────────────────  │
│  05/15/24  │ Fuel        │ expense  │ − $45         │ Edit Delete │
│ ────────────────────────────────────────────────────────────────  │
│  05/14/24  │ Groceries   │ expense  │ − $62         │ Edit Delete │
│ ────────────────────────────────────────────────────────────────  │
│  05/12/24  │ Restaurant  │ expense  │ − $38         │ Edit Delete │
│ ────────────────────────────────────────────────────────────────  │
│  05/10/24  │ Utilities   │ expense  │ − $120        │ Edit Delete │
│ ────────────────────────────────────────────────────────────────  │
│  05/01/24  │ Salary      │ income   │ + $3,500      │ Edit Delete │
│ ────────────────────────────────────────────────────────────────  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Features Visible:**

- Spacious table (24px padding)
- All columns comfortably fit
- Light gray dividers
- Amount clearly visible
- Professional appearance
- Hover states (subtle background)

---

## 🎯 Interactive States

### Mobile - Card Default State

```
┌────────────────────────────────┐
│ [F] Fuel       05/15/2024      │
│     05/15/2024           − $45 │
└────────────────────────────────┘
        no action buttons visible
              (opacity: 0)
```

### Mobile - Card Hover/Active State

```
┌────────────────────────────────┐  ← Light gray background
│ [F] Fuel       05/15/2024 ✏️🗑 │    (bg-slate-50)
│     05/15/2024           − $45 │    Action buttons visible
└────────────────────────────────┘    (opacity: 100)
```

### Desktop - Row Default State

```
│ 05/15/24 │ Fuel │ expense │ − $45 │ Edit Delete │
│ (white background)                              │
```

### Desktop - Row Hover State

```
│ 05/15/24 │ Fuel │ expense │ − $45 │ Edit Delete │
│ (light gray background - hover:bg-slate-50)    │
│                          (underline on links)   │
```

---

## 🎨 Color Reference

### Amount Colors

**Expense Amount:**

```
Text: text-slate-900
Color: #0f172a (dark slate)
Font: font-bold
Size: text-sm (14px)
Prefix: "−"
```

**Income Amount:**

```
Text: text-emerald-600
Color: #059669 (bright green)
Font: font-bold
Size: text-sm (14px)
Prefix: "+"
```

### Type Badge Colors

**Expense Badge:**

```
Background: bg-rose-100
Border: (none)
Text: text-rose-700
Shape: rounded-full
Color: #be123c (rose)
Padding: px-3 py-1
```

**Income Badge:**

```
Background: bg-emerald-100
Border: (none)
Text: text-emerald-700
Shape: rounded-full
Color: #059669 (emerald)
Padding: px-3 py-1
```

### Container Colors

**Mobile Card:**

```
Background: bg-white (default)
Hover: bg-slate-50 (#f8fafc)
Active: bg-slate-100 (#f1f5f9)
Border: divide-y divide-slate-100
```

**Desktop Table:**

```
Header: bg-slate-50/50 (semi-transparent)
Rows: bg-white (default)
Hover: bg-slate-50
Borders: divide-y divide-slate-100
```

---

## 📐 Spacing Breakdown

### Mobile Card Dimensions

```
Total Width: 100% - 40px (20px padding each side)
Typical: ~335px on iPhone 12

Card Height: Auto (based on content)
Fixed Height: No (responsive)

Padding Inside Card: px-5 py-4
  Horizontal: 20px
  Vertical: 16px

Badge Size: h-10 w-10 (40×40px)

Button Size: h-6 w-6 (24×24px)
  Touch Target: 24px (small, but ok with spacing)

Gap Between Left/Right: gap-3 (12px)
```

### Desktop Table Dimensions

```
Total Width: 100% of container

Cell Height: py-4 (16px top/bottom)
  Comfortable vertical spacing

Cell Width: Proportional (auto)
  Date: ~15%
  Category: ~20%
  Type: ~15%
  Amount: ~20%
  Actions: ~30%

Padding: px-6 py-4
  Horizontal: 24px (generous)
  Vertical: 16px (breathing room)

Header Background: bg-slate-50/50
  Opacity: 50% transparency
  Makes it distinct from data rows

Border Width: 1px (standard)
Border Color: slate-100 (light gray)
```

---

## 📊 Typography

### Mobile Card

```
Category/Title: text-sm font-medium text-slate-900
  Size: 14px
  Weight: 500 (medium)
  Color: Dark

Date: text-xs text-slate-500
  Size: 12px
  Weight: 400 (normal)
  Color: Light gray

Amount: text-sm font-bold (income: emerald, expense: dark)
  Size: 14px
  Weight: 700 (bold)
```

### Desktop Table

```
Header: text-left font-semibold text-slate-700
  Size: 14px
  Weight: 600 (semibold)
  Color: Medium gray

Data (Date): text-slate-600
  Size: 14px
  Weight: 400
  Color: Light-medium gray

Data (Category): font-medium text-slate-900
  Size: 14px
  Weight: 500
  Color: Dark

Data (Amount): font-semibold (color varies)
  Size: 14px
  Weight: 600
  Color: Green or dark

Action Links: text-xs font-semibold
  Size: 12px
  Weight: 600
  Color: Gray (with hover change)
```

---

## 🔄 Transition Reference

### Opacity Transitions (Mobile Actions)

```
Default: opacity-0 (hidden)
Hover: group-hover:opacity-100 (visible)
Transition: transition-opacity (smooth ~150ms)

Effect: Edit/Delete buttons fade in smoothly
```

### Background Transitions (Both Views)

```
Default: bg-white
Hover: bg-slate-50
Transition: transition-colors (smooth ~150ms)

Effect: Subtle background color change on hover
```

### Text Transitions (Desktop Links)

```
Default: text-slate-600
Hover: text-slate-900 hover:underline
Transition: transition (smooth)

Effect: Text darkens and underline appears
```

---

## 📱 Responsive Breakpoint Behavior

### At 639px Width (Mobile)

```
Cards showing: YES
Table showing: NO
Display: block sm:hidden applied
```

### At 640px Width (Tablet Edge)

```
Cards showing: NO
Table showing: YES
Display: Transitions immediately
         hidden sm:block applied
```

### At 1024px+ (Full Desktop)

```
Cards showing: NO (hidden)
Table showing: YES (full viewport)
Columns: All 5 visible and readable
Padding: 24px maximizing readability
```

---

## 🎬 Animation Reference

### None (Static Elements)

Most elements are static. Transitions are CSS-based:

```css
/* Smooth opacity change */
transition-opacity duration-300

/* Smooth color change */
transition-colors duration-300

/* General transition */
transition
```

No JavaScript animations (better performance).

---

## ✨ Visual Hierarchy

### Mobile (Card View)

1. **Category Badge** - Visual anchor, first thing user sees
2. **Title** - Large text, prominent
3. **Date** - Smaller gray text, secondary
4. **Amount** - Right side, bold, color-coded
5. **Actions** - Hidden until hover, discrete

### Desktop (Table View)

1. **Headers** - Light gray background, bold
2. **Category** - First data column, medium focus
3. **Type Badge** - Color-coded, draws eye
4. **Amount** - Right-aligned, easy scanning
5. **Actions** - Right side, secondary

---

## 🎯 Accessibility Highlights

### Mobile Card

- ✅ Semantic `<div>` containers
- ✅ `group` class enables `group-hover` on children
- ✅ `title` attributes on buttons (tooltip)
- ✅ Color + symbol prefix (not color alone)
- ✅ Sufficient contrast ratios

### Desktop Table

- ✅ Semantic `<table>` element
- ✅ `<thead>` and `<tbody>` structure
- ✅ `<th>` header cells (scope implied)
- ✅ Underline on link hover (not color alone)
- ✅ Sufficient text contrast

---

## 🚀 Performance Notes

### Rendering Performance

- No layout shifts during transitions
- Hardware-accelerated `opacity` changes
- No JavaScript repaints
- Both views in DOM (no mounting/unmounting)
- Smooth 60fps transitions

### Visual Load Time

- CSS classes load instantly
- No image assets
- No web font loading delay
- Emoji buttons (built-in font)
- Immediate display on breakpoint change
