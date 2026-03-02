import type { Metadata } from 'next';
import localFont from 'next/font/local';

const oshigo = localFont({
    src: '../public/fonts/oshigo.otf',
    display: 'swap',
    preload: false,
});

export const metadata: Metadata = {
    metadataBase: new URL('https://akyobox.vercel.app'),
    title: 'Akyobox - VRChatアバター Akyoゲームポータル',
    description:
        'Akyoboxは、VRChatのアバター“Akyo”をテーマにしたゲームのポータルサイトだ。「激烈！デビルヤギAkyo叩き」などのAkyoゲームをプレイできるぞ！',
    keywords: ['Akyo', 'Unity', 'WebGL', 'Game', 'ミニゲーム', 'Next.js', 'React'],
    authors: [{ name: 'らど' }],
    creator: 'らど',
    openGraph: {
        title: 'Akyobox - VRChatアバター Akyoゲームポータル',
        description: 'Akyoboxは、VRChatのアバター“Akyo”をテーマにしたゲームのポータルサイトだ。「激烈！デビルヤギAkyo叩き」などのAkyoゲームをプレイできるぞ！',
        url: 'https://akyobox.vercel.app',
        siteName: 'Akyobox',
        images: ['/og-image.png'],
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Akyobox - VRChatアバター Akyoゲームポータル',
        description: 'Akyoboxは、VRChatのアバター"Akyo"をテーマにしたゲームのポータルサイトだ。「激烈！デビルヤギAkyo叩き」などのAkyoゲームをプレイできるぞ！',
        creator: '@rad_vrc',
        images: ['/og-image.png'],
    },
    icons: {
        icon: '/icon.png',
        apple: '/apple-icon.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body style={{ margin: 0, padding: 0 }} className={oshigo.className}>
                {children}
            </body>
        </html>
    );
}
