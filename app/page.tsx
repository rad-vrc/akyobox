export const metadata = {
    title: '激烈!!デビルヤギAkyo叩き | Akyobox',
    description:
        'PCブラウザで遊べるUnity製フリーAkyoミニゲーム。デビルヤギAkyoだけを叩いてハイスコアを狙おう！',
    openGraph: {
        title: '激烈!!デビルヤギAkyo叩き',
        description:
            'PCブラウザで遊べるUnity製フリーAkyoミニゲーム。デビルヤギAkyoだけを叩いてハイスコアを狙おう！',
        url: 'https://akyobox.vercel.app/games/whack-a-devilyagiakyo/',
        siteName: 'Akyobox',
        images: [
            {
                url: 'https://akyobox.vercel.app/apple-icon.png',
                width: 512,
                height: 512,
                alt: '激烈!!デビルヤギAkyo叩き',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '激烈!!デビルヤギAkyo叩き',
        description:
            'PCブラウザで遊べるUnity製フリーAkyoミニゲーム。デビルヤギAkyoだけを叩いてハイスコアを狙おう！',
        images: ['https://akyobox.vercel.app/x-icon.png'],
    },
};

export default function Home() {
    return (
        <main style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header
                style={{
                    padding: '1rem',
                    background: '#202020',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontFamily: '"Oshigo", "JetBrains Mono", monospace',
                }}
            >
                <h1 style={{ margin: 0, fontSize: '1.7rem', letterSpacing: '1px' }}>Akyobox</h1>
            </header>
            <div style={{ flex: 1, background: '#000' }}>
                <iframe
                    src="/games/whack-a-devilyagiakyo/index.html"
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    title="激烈!!デビルヤギAkyo叩き"
                    allow="autoplay; fullscreen; vr"
                />
            </div>
        </main>
    );
}
