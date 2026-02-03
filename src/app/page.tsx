'use client';

import { useState } from 'react';
import { Search, TrendingUp, BarChart3, Users, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const router = useRouter();
  const [keywordQuery, setKeywordQuery] = useState('');

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'チャンネル分析',
      description: 'チャンネル名で検索して、最新50本の動画を詳細に分析します。',
    },
    {
      icon: <Hash className="w-6 h-6" />,
      title: 'キーワード検索',
      description: 'キーワードで人気動画を検索し、動画企画のヒントを発見します。',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '成長分析',
      description: '動画の伸び率や急上昇トレンドを可視化します。',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: '詳細な統計',
      description: '再生数、コメント率、いいね率など多角的な分析が可能です。',
    },
  ];

  // キーワード検索を実行
  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywordQuery.trim()) {
      router.push(`/youtube/keyword/${encodeURIComponent(keywordQuery.trim())}`);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-white to-[#f5f5f5] dark:from-[#0a0a0a] dark:to-[#1a1a1a] py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">PrepFeed</span>で
              <br />
              ネタ出しをサポート
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              集めて、分析して、ネタにする。
              <br />
              YouTube・Qiita・Zennの分析で、次のネタを見つけましょう。
            </p>
          </div>

          {/* 2つの検索カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* チャンネル分析カード */}
            <div className="card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FF0000] to-[#CC0000] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">チャンネル分析</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    最新50本の動画を分析
                  </p>
                </div>
              </div>

              <SearchBar />

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>人気: </span>
                <button
                  onClick={() => router.push('/youtube/channel/UClRNDVoLt5IRfLg_LsXjwvw')}
                  className="underline hover:text-[#FF0000] transition-colors mx-1"
                >
                  HIKAKIN TV
                </button>
                <button
                  onClick={() => router.push('/youtube/channel/UCgMPP6RRjktV7krOfyUewqw')}
                  className="underline hover:text-[#FF0000] transition-colors mx-1"
                >
                  はじめしゃちょー
                </button>
              </div>
            </div>

            {/* キーワード検索カード */}
            <div className="card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] rounded-lg flex items-center justify-center">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">キーワード検索</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    人気動画から企画のヒント
                  </p>
                </div>
              </div>

              <form onSubmit={handleKeywordSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={keywordQuery}
                    onChange={(e) => setKeywordQuery(e.target.value)}
                    placeholder="検索キーワードを入力"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    検索
                  </button>
                </div>
              </form>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>例: </span>
                <button
                  onClick={() => router.push('/youtube/keyword/プログラミング')}
                  className="underline hover:text-[#00D4FF] transition-colors mx-1"
                >
                  プログラミング
                </button>
                <button
                  onClick={() => router.push('/youtube/keyword/料理')}
                  className="underline hover:text-[#00D4FF] transition-colors mx-1"
                >
                  料理
                </button>
                <button
                  onClick={() => router.push('/youtube/keyword/ゲーム実況')}
                  className="underline hover:text-[#00D4FF] transition-colors mx-1"
                >
                  ゲーム実況
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            PrepFeedの特徴
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-shadow duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#FF0000] to-[#00D4FF] rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-20 bg-[#f5f5f5] dark:bg-[#1a1a1a]">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            2つの分析方法
          </h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* チャンネル分析の流れ */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#CC0000] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">チャンネル分析</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FF0000] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="text-sm">
                    <strong>チャンネル名を検索</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      分析したいチャンネル名を入力
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FF0000] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="text-sm">
                    <strong>データを自動取得</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      最新50本の動画データを取得
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FF0000] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="text-sm">
                    <strong>結果を確認</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      グラフや統計で成長を可視化
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* キーワード検索の流れ */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">キーワード検索</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#00D4FF] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="text-sm">
                    <strong>キーワードを入力</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      調べたいジャンルやテーマを入力
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#00D4FF] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="text-sm">
                    <strong>人気動画を表示</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      再生数順に最大50件を取得
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#00D4FF] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="text-sm">
                    <strong>タグから学ぶ</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      人気動画のタグで企画のヒントを発見
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            今すぐ分析を始めましょう
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            登録不要・完全無料で利用できます
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary text-lg px-8 py-4"
          >
            分析を開始する
          </button>
        </div>
      </section>
    </div>
  );
}
