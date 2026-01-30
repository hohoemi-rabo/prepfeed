---
paths:
  - "src/app/globals.css"
  - "src/app/layout.tsx"
  - "tailwind.config.*"
  - "src/components/**/*.tsx"
---

# Styling ルール

## Tailwind CSS

- Theme colors via CSS variables in `globals.css`: `--background`, `--foreground`
- Dark mode support with `dark:` prefix

## Brand Colors

| 用途 | カラー |
|------|--------|
| Channel analysis | Red (#FF0000) → Red-dark (#CC0000) gradient |
| Keyword search | Blue (#00D4FF) → Blue-dark (#0099CC) gradient |
| Charts/Success | Green #10b981 (emerald-500) |
| Instagram | Pink (#E4405F) |
| X (Twitter) | Light blue (#1DA1F2) |

## Custom CSS Classes

- `.card` - Standard card with padding, rounded corners, shadow
- `.btn-primary` - Primary button (gradient background)
- `.btn-secondary` - Secondary button (outlined)
- `.container-custom` - Max-width container with responsive padding
