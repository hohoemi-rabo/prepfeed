'use client';

import { useState, useMemo, useEffect } from 'react';
import { QiitaArticle } from '@/types/qiita';
import { ZennArticle } from '@/types/zenn';
import { NoteArticle } from '@/types/note';
import { sortArticles, ArticleSortType, ArticleSortOrder } from '@/lib/article-sort-utils';
import ArticleCard from './ArticleCard';

type Platform = 'qiita' | 'zenn' | 'note';

type Article = QiitaArticle | ZennArticle | NoteArticle;

interface ArticleListProps {
  articles: Article[];
  platform: Platform;
  sortType: ArticleSortType;
  sortOrder: ArticleSortOrder;
}

export default function ArticleList({
  articles,
  platform,
  sortType,
  sortOrder,
}: ArticleListProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sortedArticles = useMemo(() => {
    return sortArticles(articles, sortType, sortOrder);
  }, [articles, sortType, sortOrder]);

  useEffect(() => {
    setIsTransitioning(true);
    setVisibleCount(10);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [sortType, sortOrder]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, sortedArticles.length));
  };

  const visibleArticles = useMemo(() => {
    return sortedArticles.slice(0, visibleCount);
  }, [sortedArticles, visibleCount]);

  if (articles.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
          記事が見つかりません
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          該当する記事がありませんでした。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`space-y-6 transition-opacity duration-150 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {visibleArticles.map((article, index) => (
          <div
            key={`${sortType}-${sortOrder}-${article.id}`}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ArticleCard
              article={article}
              platform={platform}
            />
          </div>
        ))}
      </div>

      {visibleCount < sortedArticles.length && (
        <div className="text-center mt-8">
          <button onClick={handleLoadMore} className="btn-secondary">
            さらに{Math.min(10, sortedArticles.length - visibleCount)}件の記事を表示
            <span className="text-sm ml-2">
              ({visibleCount}/{sortedArticles.length})
            </span>
          </button>
        </div>
      )}

      {visibleCount >= sortedArticles.length && sortedArticles.length > 10 && (
        <div className="text-center mt-8 py-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            全{sortedArticles.length}件の記事を表示しました
          </p>
        </div>
      )}
    </div>
  );
}
