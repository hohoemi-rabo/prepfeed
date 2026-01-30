---
paths:
  - "src/app/**/*.tsx"
  - "src/app/**/*.ts"
  - "next.config.*"
---

# Next.js 15 App Router ルール

## params / searchParams が Promise に変更

Server Components では `await`、Client Components では `use()` で展開する。

```typescript
// Server Component
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
}

// Client Component
'use client'
import { use } from 'react';
export default function Page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;
}

// generateMetadata
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
}
```

## fetch がデフォルトでキャッシュされない

Next.js 15 では `fetch()` はデフォルトで `no-store` 相当。キャッシュしたい場合は明示的に指定する。

```typescript
const data = await fetch('https://...')                              // キャッシュされない
const cached = await fetch('https://...', { cache: 'force-cache' }) // キャッシュされる
const revalidated = await fetch('https://...', { next: { revalidate: 600 } }) // 10分キャッシュ
```

ルート全体のデフォルト変更: `export const fetchCache = 'default-cache'`

## cookies() / headers() が非同期

```typescript
import { cookies } from 'next/headers';
const cookieStore = await cookies(); // await 必須
const token = cookieStore.get('token');

import { headers } from 'next/headers';
const headersList = await headers(); // await 必須
const userAgent = headersList.get('user-agent');
```

## Server vs Client Components

- **Server Components** (default): layout, pages — データ取得、メタデータ生成に使用
- **Client Components** (`'use client'`): イベントハンドラ、hooks、ブラウザAPI が必要な場合に使用
