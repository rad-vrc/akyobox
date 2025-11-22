import type { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://akyobox.vercel.app'),
    title: {
        default: 'Akyobox',
        template: '%s | Akyobox',
    },
    description:
        'Akyoboxは、AkyoをテーマにしたUnity WebGLゲームのポータルサイトだ。「激烈！デビルヤギAkyo叩き」などのゲームをPCブラウザで直接プレイできるぞ！',
    keywords: ['Akyo', 'Unity', 'WebGL', 'Game', 'ミニゲーム', 'Next.js', 'React'],
    authors: [{ name: 'らど' }],
    creator: 'らど',
    openGraph: {
        title: 'Akyobox',
        description: 'デビルヤギAkyoをテーマにしたUnity WebGLゲームをブラウザでプレイしよう！',
        url: 'https://akyobox.vercel.app',
        siteName: 'Akyobox',
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Akyobox',
        description: 'デビルヤギAkyoをテーマにしたUnity WebGLゲームをブラウザでプレイしよう！',
        creator: '@rad_vrc',
        images: ['/opengraph-image'],
    },
    icons: {
        icon: '/icon.png',
        apple: '/apple-icon.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>{children}</body>
        </html>
    );
}
