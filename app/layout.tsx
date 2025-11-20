import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://akyobox.vercel.app'),
  title: {
    default: 'Akyobox',
    template: '%s | Akyobox',
  },
  description: 'Akyoboxは、AkyoをテーマにしたUnity WebGLゲームのポータルサイトです。「激烈！デビルヤギAkyo叩き」などのゲームをブラウザで直接プレイできます。',
  keywords: ['Akyo', 'Unity', 'WebGL', 'Game', 'モグラ叩き', 'Next.js', 'React'],
  authors: [{ name: 'らど' }],
  creator: 'らど',
  openGraph: {
    title: 'Akyobox',
    description: 'AkyoをテーマにしたUnity WebGLゲームをブラウザでプレイしよう！',
    url: 'https://akyobox.vercel.app',
    siteName: 'Akyobox',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akyobox',
    description: 'AkyoをテーマにしたUnity WebGLゲームをブラウザでプレイしよう！',
    creator: '@rad_vrc',
    images: ['/opengraph-image'], // 明示的に指定（Next.jsが自動生成するパス）
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>{children}</body>
    </html>
  )
}
