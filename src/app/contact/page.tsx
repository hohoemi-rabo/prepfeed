import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Github, HelpCircle, ExternalLink, CheckCircle, Instagram } from 'lucide-react';

export const metadata: Metadata = {
  title: 'お問い合わせ | PrepFeed',
  description: 'PrepFeedへのお問い合わせ方法。GitHub IssuesまたはInstagramダイレクトメッセージでお気軽にどうぞ。',
};

export default function ContactPage() {
  return (
    <div className="container-custom py-8">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        ホームに戻る
      </Link>

      {/* ページタイトル */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">お問い合わせ</h1>
        <p className="text-gray-600 dark:text-gray-400">
          PrepFeedに関するご質問、ご要望、不具合報告などをお気軽にお寄せください。
        </p>
      </div>

      {/* 2つのお問い合わせ方法 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">お問い合わせ方法を選択してください</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* GitHub Issues */}
          <div className="card bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-3 mb-4">
                <Github className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">GitHub Issues</h3>
                  <p className="text-sm opacity-90">
                    過去の質問を検索できる<br />
                    公開されたやり取りで透明性が高い
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <a
                  href="https://github.com/hohoemi-rabo/prepfeed/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  お問い合わせする
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs opacity-75 mt-2 text-center">
                  ※ GitHubアカウントが必要です
                </p>
              </div>
            </div>
          </div>

          {/* Instagram DM */}
          <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-3 mb-4">
                <Instagram className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Instagram DM</h3>
                  <p className="text-sm opacity-90">
                    個別にやり取りできる<br />
                    お気軽にメッセージを送れる
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <a
                  href="https://www.instagram.com/masayuki.kiwami/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Instagram className="w-5 h-5" />
                  DMを送る
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs opacity-75 mt-2 text-center">
                  ※ Instagramアカウントが必要です
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* GitHub Issuesとは */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">GitHub Issuesとは？</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              GitHub Issuesは、ソフトウェア開発でよく使われる<strong>お問い合わせ・要望管理システム</strong>です。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>誰でも無料で利用できます</li>
              <li>過去のお問い合わせを検索して閲覧できます（同じ質問を探せます）</li>
              <li>開発者と直接やり取りができます</li>
              <li>他のユーザーの質問も参考にできます</li>
            </ul>
          </div>
        </div>

        {/* 使い方ステップ */}
        <div className="card">
          <div className="flex items-start gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">お問い合わせの手順（3ステップ）</h2>
          </div>

          <div className="space-y-6">
            {/* ステップ1 */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="font-bold text-lg mb-2">ステップ1: GitHub Issuesページを開く</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                下記のボタンをクリックして、GitHub Issuesのページを開きます。
              </p>
              <a
                href="https://github.com/hohoemi-rabo/prepfeed/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity"
              >
                <Github className="w-5 h-5" />
                Issuesページを開く
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                ※ GitHubアカウントがなくても、過去のお問い合わせは閲覧できます
              </p>
            </div>

            {/* ステップ2 */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="font-bold text-lg mb-2">ステップ2: 過去の質問を確認（任意）</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                同じような質問がないか、検索してみましょう。<br />
                既に回答がある場合は、すぐに解決できるかもしれません。
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">🔍 検索のコツ</p>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• ページ上部の検索ボックスでキーワード検索</li>
                  <li>• 「is:closed」で解決済みの質問も見られます</li>
                  <li>• 「is:open」で対応中の質問だけ表示</li>
                </ul>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="font-bold text-lg mb-2">ステップ3: 新しいIssueを作成</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                <strong>緑色の「New issue」ボタン</strong>をクリックして、お問い合わせを投稿します。
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
                <p className="text-sm font-medium mb-2">📝 記入項目</p>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    <strong>Title（タイトル）:</strong> 質問や要望を一言で<br />
                    例: 「チャンネル検索ができません」「○○機能の追加希望」
                  </li>
                  <li>
                    <strong>Comment（本文）:</strong> 詳しい内容を記入<br />
                    例: 「チャンネル名を入力しても検索結果が表示されません。ブラウザはChromeです。」
                  </li>
                </ul>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ GitHubアカウントが必要です（無料・1分で作成可能）
              </p>
            </div>
          </div>
        </div>

        {/* GitHubアカウントを持っていない方へ */}
        <div className="card bg-blue-50 dark:bg-blue-950">
          <div className="flex items-start gap-3 mb-4">
            <Github className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">GitHubアカウントを持っていない方へ</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              GitHubアカウントは<strong>無料</strong>で、<strong>1分程度</strong>で作成できます。
            </p>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
              <p className="font-medium mb-2">アカウント作成手順:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  <a
                    href="https://github.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    GitHub登録ページ
                  </a>
                  を開く
                </li>
                <li>メールアドレスを入力（Gmail等でOK）</li>
                <li>パスワードを設定</li>
                <li>ユーザー名を決める</li>
                <li>メール認証を完了（確認メールが届きます）</li>
              </ol>
            </div>
            <p className="text-sm">
              ※ GitHubは世界中の開発者が使っている安全なサービスです
            </p>
          </div>
        </div>

        {/* お問い合わせ例 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">こんなお問い合わせをお待ちしています</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-medium mb-2 text-emerald-600 dark:text-emerald-400">✅ 不具合報告</p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• エラーが出て使えない</li>
                <li>• データが正しく表示されない</li>
                <li>• ボタンが反応しない</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-medium mb-2 text-blue-600 dark:text-blue-400">💡 機能要望</p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• こんな機能がほしい</li>
                <li>• ○○の表示を改善してほしい</li>
                <li>• △△と比較したい</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-medium mb-2 text-yellow-600 dark:text-yellow-400">❓ 使い方の質問</p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• ○○の使い方が分からない</li>
                <li>• このデータは何を意味する？</li>
                <li>• どう活用すればいい？</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-medium mb-2 text-purple-600 dark:text-purple-400">📢 その他</p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• 感想・フィードバック</li>
                <li>• 改善提案</li>
                <li>• その他なんでも</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="card border-2 border-yellow-400 dark:border-yellow-600">
          <h2 className="text-xl font-bold mb-4">⚠️ お問い合わせ時の注意事項</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>個人情報（本名、住所、電話番号など）は記入しないでください</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>お問い合わせ内容は公開されます（誰でも閲覧可能です）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>回答までお時間をいただく場合があります</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>すべてのご要望にお応えできるとは限りません</span>
            </li>
          </ul>
        </div>

        {/* お問い合わせボタン（再表示） */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">今すぐお問い合わせ</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <a
              href="https://github.com/hohoemi-rabo/prepfeed/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 px-6 py-6 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              <Github className="w-8 h-8" />
              <span>GitHub Issues</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/masayuki.kiwami/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 px-6 py-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-8 h-8" />
              <span>Instagram DM</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ホームに戻るボタン */}
      <div className="mt-8 text-center">
        <Link href="/" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
