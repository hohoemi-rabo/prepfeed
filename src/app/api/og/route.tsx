import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータから情報を取得
    const channelName = searchParams.get('channel') || 'チャンネル';
    const subscribers = searchParams.get('subscribers') || '0';
    const videoCount = searchParams.get('videos') || '0';
    const viewCount = searchParams.get('views') || '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* メインコンテナ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              width: '100%',
              height: '100%',
            }}
          >
            {/* サービスロゴ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                PrepFeed
              </div>
            </div>

            {/* チャンネル名 */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '40px',
                maxWidth: '1000px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {channelName}
            </div>

            {/* 統計情報 */}
            <div
              style={{
                display: 'flex',
                gap: '60px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '30px 40px',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                >
                  {formatNumber(parseInt(subscribers))}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    color: '#ffffff',
                    opacity: 0.9,
                  }}
                >
                  登録者
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '30px 40px',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                >
                  {formatNumber(parseInt(viewCount))}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    color: '#ffffff',
                    opacity: 0.9,
                  }}
                >
                  総再生数
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '30px 40px',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                >
                  {videoCount}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    color: '#ffffff',
                    opacity: 0.9,
                  }}
                >
                  動画数
                </div>
              </div>
            </div>

            {/* キャッチコピー */}
            <div
              style={{
                fontSize: '28px',
                color: '#ffffff',
                opacity: 0.9,
                textAlign: 'center',
              }}
            >
              集めて、分析して、ネタにする。
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

// 数値フォーマット関数
function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}億`;
  }
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}千万`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString();
}