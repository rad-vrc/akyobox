import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Akyobox | ゲームポータル',
    description: 'Akyoboxのゲームポータル。公開中のゲームを一覧から選んでそのままプレイできます。',
    openGraph: {
        title: 'Akyobox | ゲームポータル',
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
    statusLabel: '公開中' | '準備中';
    genre: string;
    playTime: string;
};

const liveGames: GameCard[] = [
    {
        id: 'whack-a-devilyagiakyo',
        title: '激烈!!デビルヤギAkyo叩き',
        shortDescription: 'デビルヤギAkyoだけを見極めて叩くハイスピードもぐらたたき。',
        href: '/games/whack-a-devilyagiakyo/',
        image: '/games/whack-a-devilyagiakyo/TemplateData/bg.png',
        imageAlt: '激烈!!デビルヤギAkyo叩きのゲームイメージ',
        statusLabel: '公開中',
        genre: 'アクション',
        playTime: '1プレイ 1-3分',
    },
];

const comingSoonGames: GameCard[] = [
    {
        id: 'coming-soon-slot-1',
        title: 'Next Game',
        shortDescription: '次回公開予定のゲームスロットです。',
        href: '#',
        image: '/apple-icon.png',
        imageAlt: '次回公開予定ゲームのプレースホルダー',
        statusLabel: '準備中',
        genre: 'TBD',
        playTime: 'TBD',
    },
    {
        id: 'coming-soon-slot-2',
        title: 'Another Slot',
        shortDescription: '公開予定ゲームをここに追加できます。',
        href: '#',
        image: '/apple-icon.png',
        imageAlt: '次回公開予定ゲームのプレースホルダー',
        statusLabel: '準備中',
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
                            <dt>目安</dt>
                            <dd>{game.playTime}</dd>
                        </div>
                    </dl>
                    <span className={styles.disabledButton}>公開待ち</span>
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
                        <dt>目安</dt>
                        <dd>{game.playTime}</dd>
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
                    <p className={styles.brandLabel}>AKYOBOX PORTAL</p>
                    <h1 className={styles.heroTitle}>遊びたいゲームを選んで、すぐアクセス。</h1>
                    <p className={styles.heroLead}>
                        Akyoboxの各ゲームに直接飛べるポータルです。これから追加されるタイトルもここに集約します。
                    </p>
                </header>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>公開中ゲーム</h2>
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
                        <h2>近日公開</h2>
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
