'use client';

import { useState } from 'react';
import {
  Search,
  TrendingUp,
  BarChart3,
  Users,
  Hash,
  Bell,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

type Platform = 'youtube' | 'qiita' | 'zenn' | 'note';

const PLATFORMS = [
  {
    id: 'youtube' as Platform,
    label: 'YouTube',
    color: '#FF0000',
    colorDark: '#CC0000',
  },
  {
    id: 'qiita' as Platform,
    label: 'Qiita',
    color: '#55C500',
    colorDark: '#449E00',
  },
  {
    id: 'zenn' as Platform,
    label: 'Zenn',
    color: '#3EA8FF',
    colorDark: '#2B8AD9',
  },
  {
    id: 'note' as Platform,
    label: 'note',
    color: '#41C9B4',
    colorDark: '#2FA898',
  },
] as const;

export default function Home() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [keywordQuery, setKeywordQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const current = PLATFORMS.find((p) => p.id === platform)!;

  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordQuery.trim()) return;
    const q = encodeURIComponent(keywordQuery.trim());
    if (platform === 'youtube') {
      router.push(`/youtube/keyword/${q}`);
    } else {
      router.push(`/${platform}/keyword/${q}`);
    }
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const q = encodeURIComponent(userQuery.trim());
    router.push(`/${platform}/user/${q}`);
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
              YouTube・Qiita・Zenn・noteの分析で、次のネタを見つけましょう。
            </p>
          </div>

          {/* プラットフォームタブ */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPlatform(p.id);
                    setKeywordQuery('');
                    setUserQuery('');
                  }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    platform === p.id
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  style={
                    platform === p.id
                      ? { backgroundColor: p.color }
                      : undefined
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 検索カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* YouTube: チャンネル分析 / Qiita・Zenn: ユーザー検索 */}
            {platform === 'youtube' ? (
              <div className="card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to right, ${current.color}, ${current.colorDark})`,
                    }}
                  >
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
                    onClick={() =>
                      router.push('/youtube/channel/UClRNDVoLt5IRfLg_LsXjwvw')
                    }
                    className="underline hover:text-[#FF0000] transition-colors mx-1"
                  >
                    HIKAKIN TV
                  </button>
                  <button
                    onClick={() =>
                      router.push('/youtube/channel/UCgMPP6RRjktV7krOfyUewqw')
                    }
                    className="underline hover:text-[#FF0000] transition-colors mx-1"
                  >
                    はじめしゃちょー
                  </button>
                </div>
              </div>
            ) : (
              <div className="card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to right, ${current.color}, ${current.colorDark})`,
                    }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">ユーザー検索</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {platform === 'qiita'
                        ? 'Qiitaユーザーの記事を分析'
                        : platform === 'note'
                          ? 'noteクリエイターの記事を分析'
                          : 'Zennユーザーの記事を分析'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUserSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder={
                        platform === 'qiita'
                          ? 'Qiitaユーザー名を入力'
                          : platform === 'note'
                            ? 'クリエイター名 で検索'
                            : 'Zennユーザー名を入力'
                      }
                      className="w-full pl-12 pr-20 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={
                        {
                          '--tw-ring-color': current.color,
                        } as React.CSSProperties
                      }
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{
                        background: `linear-gradient(to right, ${current.color}, ${current.colorDark})`,
                      }}
                    >
                      検索
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>例: </span>
                  {platform === 'qiita' ? (
                    <>
                      <button
                        onClick={() => router.push('/qiita/user/Qiita')}
                        className="underline transition-colors mx-1 hover:text-[#55C500]"
                      >
                        Qiita
                      </button>
                      <button
                        onClick={() => router.push('/qiita/user/jnchito')}
                        className="underline transition-colors mx-1 hover:text-[#55C500]"
                      >
                        jnchito
                      </button>
                    </>
                  ) : platform === 'note' ? (
                    <>
                      <button
                        onClick={() => router.push('/note/user/nozomi_iijima')}
                        className="underline transition-colors mx-1 hover:text-[#41C9B4]"
                      >
                        nozomi_iijima
                      </button>
                      <button
                        onClick={() => router.push('/note/user/shinya_matsuyama')}
                        className="underline transition-colors mx-1 hover:text-[#41C9B4]"
                      >
                        shinya_matsuyama
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push('/zenn/user/catnose99')}
                        className="underline transition-colors mx-1 hover:text-[#3EA8FF]"
                      >
                        catnose99
                      </button>
                      <button
                        onClick={() => router.push('/zenn/user/uhyo')}
                        className="underline transition-colors mx-1 hover:text-[#3EA8FF]"
                      >
                        uhyo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* キーワード検索カード（共通） */}
            <div className="card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      platform === 'youtube'
                        ? 'linear-gradient(to right, #00D4FF, #0099CC)'
                        : `linear-gradient(to right, ${current.color}, ${current.colorDark})`,
                  }}
                >
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">キーワード検索</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {platform === 'youtube'
                      ? '人気動画から企画のヒント'
                      : '人気記事からトレンドを発見'}
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
                    className="w-full pl-12 pr-20 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={
                      {
                        '--tw-ring-color':
                          platform === 'youtube' ? '#00D4FF' : current.color,
                      } as React.CSSProperties
                    }
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{
                      background:
                        platform === 'youtube'
                          ? 'linear-gradient(to right, #00D4FF, #0099CC)'
                          : `linear-gradient(to right, ${current.color}, ${current.colorDark})`,
                    }}
                  >
                    検索
                  </button>
                </div>
              </form>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>例: </span>
                {platform === 'youtube' ? (
                  <>
                    <button
                      onClick={() =>
                        router.push('/youtube/keyword/プログラミング')
                      }
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
                      onClick={() =>
                        router.push('/youtube/keyword/ゲーム実況')
                      }
                      className="underline hover:text-[#00D4FF] transition-colors mx-1"
                    >
                      ゲーム実況
                    </button>
                  </>
                ) : platform === 'note' ? (
                  <>
                    <button
                      onClick={() => router.push('/note/keyword/AI')}
                      className="underline hover:text-[#41C9B4] transition-colors mx-1"
                    >
                      AI
                    </button>
                    <button
                      onClick={() => router.push('/note/keyword/デザイン')}
                      className="underline hover:text-[#41C9B4] transition-colors mx-1"
                    >
                      デザイン
                    </button>
                    <button
                      onClick={() => router.push('/note/keyword/エンジニア')}
                      className="underline hover:text-[#41C9B4] transition-colors mx-1"
                    >
                      エンジニア
                    </button>
                  </>
                ) : platform === 'qiita' ? (
                  <>
                    <button
                      onClick={() => router.push('/qiita/keyword/React')}
                      className="underline hover:text-[#55C500] transition-colors mx-1"
                    >
                      React
                    </button>
                    <button
                      onClick={() => router.push('/qiita/keyword/TypeScript')}
                      className="underline hover:text-[#55C500] transition-colors mx-1"
                    >
                      TypeScript
                    </button>
                    <button
                      onClick={() => router.push('/qiita/keyword/AI')}
                      className="underline hover:text-[#55C500] transition-colors mx-1"
                    >
                      AI
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/zenn/keyword/Next.js')}
                      className="underline hover:text-[#3EA8FF] transition-colors mx-1"
                    >
                      Next.js
                    </button>
                    <button
                      onClick={() => router.push('/zenn/keyword/Rust')}
                      className="underline hover:text-[#3EA8FF] transition-colors mx-1"
                    >
                      Rust
                    </button>
                    <button
                      onClick={() =>
                        router.push('/zenn/keyword/インフラ')
                      }
                      className="underline hover:text-[#3EA8FF] transition-colors mx-1"
                    >
                      インフラ
                    </button>
                  </>
                )}
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
            {[
              {
                icon: <Layers className="w-6 h-6" />,
                title: 'マルチプラットフォーム',
                description:
                  'YouTube・Qiita・Zenn・noteを横断して、コンテンツのトレンドを分析します。',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'トレンド分析',
                description:
                  'キーワードの人気度や成長率を可視化し、注目のテーマを発見します。',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI分析',
                description:
                  'Gemini AIによるトレンドスコアリングとコンテンツ企画の提案。',
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: '監視・自動収集',
                description:
                  'キーワードやチャンネルを登録し、定期的にデータを自動収集します。',
              },
            ].map((feature, index) => (
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

      {/* 無料/有料機能セクション */}
      <section className="py-20 bg-[#f5f5f5] dark:bg-[#1a1a1a]">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            無料で使える、もっと使える
          </h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 無料機能 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">無料プラン</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    登録不要で今すぐ使える
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'YouTubeチャンネル分析（最新50本）',
                  'YouTubeキーワード検索（人気50件）',
                  'Qiitaユーザー・キーワード検索',
                  'Zennユーザー・キーワード検索',
                  'noteクリエイター・キーワード検索',
                  'グラフ・統計表示',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 有料機能 */}
            <div className="card relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#FF0000] to-[#00D4FF] text-white rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#00D4FF] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">プレミアムプラン</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ログインで利用可能
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  '監視設定（キーワード・チャンネル自動監視）',
                  'AI分析（Geminiによるトレンド分析）',
                  'ダッシュボード（収集データ一覧）',
                  'コンテンツ企画提案',
                  'データの自動定期収集',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-0.5">&#10003;</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
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
            YouTube・Qiita・Zenn・noteの分析が無料で利用できます
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
