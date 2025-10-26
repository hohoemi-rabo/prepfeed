'use client';

import { Search, TrendingUp, BarChart3, Users } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'かんたん検索',
      description: 'チャンネル名を入力するだけで、すぐに分析を開始できます。',
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
    {
      icon: <Users className="w-6 h-6" />,
      title: '完全無料',
      description: 'すべての機能を無料でご利用いただけます。',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-white to-[#f5f5f5] dark:from-[#0a0a0a] dark:to-[#1a1a1a] py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">YouTubeスコープ</span>で
              <br />
              動画企画をサポート
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              配信者のための無料分析ツール。
              <br />
              チャンネル分析とキーワード検索で、次の一手を見つけましょう。
            </p>

            {/* 検索フォーム */}
            <div className="mb-8">
              <SearchBar className="max-w-xl mx-auto" autoFocus />
            </div>

            {/* サンプル検索 */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>人気の検索: </span>
              <button className="underline hover:text-[#FF0000] transition-colors mx-1">
                HIKAKIN TV
              </button>
              <button className="underline hover:text-[#FF0000] transition-colors mx-1">
                はじめしゃちょー
              </button>
              <button className="underline hover:text-[#FF0000] transition-colors mx-1">
                東海オンエア
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            YouTubeスコープの特徴
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
            かんたん3ステップ
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#FF0000] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">チャンネル名を検索</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    分析したいYouTubeチャンネル名を入力して検索します。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#FF0000] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">データを自動取得</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    最新50本の動画データを自動で取得し、分析します。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#FF0000] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">結果を確認</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    グラフや統計データで、チャンネルの成長を可視化します。
                  </p>
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