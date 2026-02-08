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

| 用途 | カラー | CSS変数 |
|------|--------|---------|
| YouTube / Primary | Red (#FF0000) → Red-dark (#CC0000) | `--color-primary` |
| Accent | Blue (#00D4FF) | `--color-accent` |
| Qiita | Green (#55C500) | `--color-qiita` |
| Zenn | Blue (#3EA8FF) | `--color-zenn` |
| note | Teal (#41C9B4) | `--color-note` |
| Charts/Success | Green #10b981 (emerald-500) | — |
| Instagram | Pink (#E4405F) | — |
| X (Twitter) | Light blue (#1DA1F2) | — |

## Custom CSS Classes

- `.card` - Standard card with padding, rounded corners, shadow
- `.btn-primary` - Primary button (gradient background)
- `.btn-secondary` - Secondary button (outlined)
- `.container-custom` - Max-width container with responsive padding
