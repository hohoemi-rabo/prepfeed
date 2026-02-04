'use client';

import { Sparkles } from 'lucide-react';

export default function UpgradeBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white mb-6">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold text-lg">プレミアムプランにアップグレード</h3>
        </div>
        <p className="text-white/90 text-sm mb-4">
          監視設定の追加、AI分析、データエクスポートなどの機能をご利用いただけます。
        </p>
        <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
          詳しく見る
        </button>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 right-16 w-20 h-20 bg-white/5 rounded-full translate-y-4" />
    </div>
  );
}
