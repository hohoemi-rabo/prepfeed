'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Settings, Download } from 'lucide-react';

const TABS = [
  { href: '/dashboard', label: '分析', icon: BarChart3 },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
  { href: '/dashboard/export', label: 'エクスポート', icon: Download },
] as const;

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/analysis');
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              active
                ? 'border-[#FF0000] text-[#FF0000]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
