import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Akyobox - VRChatアバター Akyoゲームポータル',
    description:
        'Akyoboxのゲームポータル。公開中のAkyoゲームを一覧から選んでそのままプレイできるぞ！。',
    openGraph: {
        title: 'Akyobox - VRChatアバター Akyoゲームポータル',
        description:
            'Akyoboxのゲームポータル。公開中のAkyoゲームを一覧から選んでそのままプレイできるぞ！',
        url: 'https://akyobox.vercel.app/',
        siteName: 'Akyobox',
        images: ['https://akyobox.vercel.app/x-icon.png'],
        type: 'website',
    },
};

type GameCard = {
    id: string;
    shortDescription: string;
    href: string;
    image: string;
    imageAlt: string;
    genre: string;
    playTime: string;
    creator: string;
};

const games: GameCard[] = [
    {
        id: 'whack-a-devilyagiakyo',
        shortDescription:
            'PCブラウザむけフリーAkyoミニゲーム。\nデビルヤギAkyoだけをたたいてハイスコアをねらおう！',
        href: '/games/whack-a-devilyagiakyo/',
        image: '/apple-icon.png',
        imageAlt: 'デビルヤギAkyoたたきのタイトルイメージ',
        genre: 'Akyoたたき',
        playTime: '1min',
        creator: 'らど/rad1031',
    },
];

function GameCardView({ game }: { game: GameCard }) {
    return (
        <article className={styles.card}>
            <div className={styles.thumbnail}>
                <Image
                    src={game.image}
                    alt={game.imageAlt}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                />
            </div>
            <div className={styles.cardBody}>
                <p className={styles.cardDescription}>{game.shortDescription}</p>
                <dl className={styles.metaList}>
                    <div>
                        <dt>ジャンル</dt>
                        <dd>{game.genre}</dd>
                    </div>
                    <div>
                        <dt>プレイじかん</dt>
                        <dd>{game.playTime}</dd>
                    </div>
                    <div>
                        <dt>さくしゃ</dt>
                        <dd>{game.creator}</dd>
                    </div>
                </dl>
                <Link href={game.href} className={styles.playButton}>
                    プレイする
                </Link>
            </div>
        </article>
    );
}

export default function Home() {
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.hero}>
                    <h1 className={styles.visuallyHidden}>Akyobox</h1>
                    <Image
                        src="/logo_akyobox.png"
                        alt="Akyobox ロゴ"
                        width={1980}
                        height={305}
                        className={styles.heroLogo}
                        priority
                        sizes="(max-width: 680px) 92vw, (max-width: 1200px) 78vw, 980px"
                    />
                </header>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>こうかいちゅう</h2>
                    </div>
                    <div className={styles.cardGrid}>
                        {games.map((game) => (
                            <GameCardView key={game.id} game={game} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
