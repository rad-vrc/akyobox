import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Akyobox - VRChatアバター Akyoゲームポータル',
    description: 'Akyoboxのゲームポータル。公開中のゲームを一覧から選んでそのままプレイできます。',
    openGraph: {
        title: 'Akyobox - VRChatアバター Akyoゲームポータル',
        description: 'Akyoboxのゲームポータル。公開中のゲームを一覧から選んでそのままプレイできます。',
        url: 'https://akyobox.vercel.app/',
        siteName: 'Akyobox',
        images: [
            {
                url: 'https://akyobox.vercel.app/apple-icon.png',
                width: 512,
                height: 512,
                alt: 'Akyobox',
            },
        ],
        type: 'website',
    },
};

type GameCard = {
    id: string;
    title: string;
    shortDescription: string;
    href: string;
    image: string;
    imageAlt: string;
    statusLabel: 'こうかいちゅう' | 'じゅんびちゅう';
    genre: string;
    playTime: string;
};

const liveGames: GameCard[] = [
    {
        id: 'whack-a-devilyagiakyo',
        title: 'デビルヤギ Akyo たたき',
        shortDescription: 'デビルヤギ Akyo だけを たたく もぐらたたき。',
        href: '/games/whack-a-devilyagiakyo/',
        image: '/games/whack-a-devilyagiakyo/card-image.webp',
        imageAlt: 'デビルヤギ Akyo たたき の たいとる いめーじ',
        statusLabel: 'こうかいちゅう',
        genre: 'アクション',
        playTime: '1ぷん',
    },
];

const comingSoonGames: GameCard[] = [
    {
        id: 'coming-soon-slot-1',
        title: 'Next Game',
        shortDescription: 'じゅんびちゅう の げーむ すろっと です。',
        href: '#',
        image: '/games/coming-soon.webp',
        imageAlt: 'じゅんびちゅう げーむ の ぷれーすほるだー',
        statusLabel: 'じゅんびちゅう',
        genre: 'TBD',
        playTime: 'TBD',
    },
    {
        id: 'coming-soon-slot-2',
        title: 'Another Slot',
        shortDescription: 'ここに つぎの げーむ を ついか できます。',
        href: '#',
        image: '/games/coming-soon.webp',
        imageAlt: 'じゅんびちゅう げーむ の ぷれーすほるだー',
        statusLabel: 'じゅんびちゅう',
        genre: 'TBD',
        playTime: 'TBD',
    },
];

function GameCardView({ game, disabled }: { game: GameCard; disabled?: boolean }) {
    const cardClassName = disabled ? `${styles.card} ${styles.cardDisabled}` : styles.card;

    if (disabled) {
        return (
            <article className={cardClassName} aria-disabled="true">
                <div className={styles.thumbnail}>
                    <Image src={game.image} alt={game.imageAlt} fill sizes="(max-width: 900px) 100vw, 33vw" />
                    <span className={styles.badgeMuted}>{game.statusLabel}</span>
                </div>
                <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{game.title}</h3>
                    <p className={styles.cardDescription}>{game.shortDescription}</p>
                    <dl className={styles.metaList}>
                        <div>
                            <dt>ジャンル</dt>
                            <dd>{game.genre}</dd>
                        </div>
                        <div>
                            <dt>ぷれいじかん</dt>
                            <dd>{game.playTime}</dd>
                        </div>
                    </dl>
                    <span className={styles.disabledButton}>じゅんびちゅう</span>
                </div>
            </article>
        );
    }

    return (
        <article className={cardClassName}>
            <div className={styles.thumbnail}>
                <Image src={game.image} alt={game.imageAlt} fill sizes="(max-width: 900px) 100vw, 33vw" />
                <span className={styles.badgeLive}>{game.statusLabel}</span>
            </div>
            <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{game.title}</h3>
                <p className={styles.cardDescription}>{game.shortDescription}</p>
                <dl className={styles.metaList}>
                    <div>
                        <dt>ジャンル</dt>
                        <dd>{game.genre}</dd>
                    </div>
                    <div>
                        <dt>ぷれいじかん</dt>
                        <dd>{game.playTime}</dd>
                    </div>
                </dl>
                <Link href={game.href} className={styles.playButton}>
                    PLAY
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
                    <h1 className={styles.heroTitle}>Akyobox</h1>
                </header>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>こうかいちゅう げーむ</h2>
                        <p>{liveGames.length} title</p>
                    </div>
                    <div className={styles.cardGrid}>
                        {liveGames.map((game) => (
                            <GameCardView key={game.id} game={game} />
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>じゅんびちゅう</h2>
                        <p>{comingSoonGames.length} slot</p>
                    </div>
                    <div className={styles.cardGrid}>
                        {comingSoonGames.map((game) => (
                            <GameCardView key={game.id} game={game} disabled />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
