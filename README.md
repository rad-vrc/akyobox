# Akyobox

最終更新日: 2026-02-24

## 概要

Akyobox は、Akyoゲームをまとめた Web ポータルです。  
**トップページ (`/`) はポータルページとして機能し、公開中ゲームへの導線を提供するのが主目的です。**

現在の公開中タイトル:

- `激烈!! デビルヤギAkyo叩き` (`/games/whack-a-devilyagiakyo/`)

公開URL:

- `https://akyobox.vercel.app`

## トップページの役割（重要）

トップページ (`app/page.tsx`) は、次の責務を持つ「Akyoゲームのポータル画面」です。

- ポータルロゴ表示（`public/logo_akyobox.png`）
- 公開中ゲームカードの表示
- 各ゲームURLへの遷移導線（`/games/...`）

ゲーム本体を直接実装するページではなく、**ゲームへの入口を集約するハブ**として運用します。

## 技術スタック

- Next.js 16 (App Router)
- React 19
- TypeScript
- Vercel
- Vercel KV（ランキング保存）
- Unity 6（WebGLビルド）

## ディレクトリ構成

```text
app/
  api/highscores/route.ts     # ランキング API (GET/POST)
  layout.tsx                  # サイト共通メタデータ
  page.tsx                    # トップページ（ポータル）
  page.module.css             # ポータルスタイル

public/
  bg.webp                     # 共通背景
  logo_akyobox.png            # トップページロゴ
  games/
    whack-a-devilyagiakyo/
      index.html              # Unity WebGL ランチャー
      Build/                  # Unityビルド成果物(.br含む)
      TemplateData/           # WebGLテンプレート用CSS/画像

Unity/
  whack-a-devilyagiakyo/      # Unityプロジェクト
```

## ランキング API

エンドポイント: `/api/highscores`

- `GET`: トップランキング取得（キャッシュ無効）
- `POST`: スコア送信（自己ベスト更新 + 名前更新）

実装ファイル:

- `app/api/highscores/route.ts`

データ管理の概要:

- Sorted Set: `highscores`
- 詳細キー: `detail:user:<anonId>`
- `anonId` 必須（匿名ユーザー同士の衝突回避）

## Unity WebGL 運用メモ

`/games/whack-a-devilyagiakyo/` は `public` 配下の静的 Unity WebGL を配信します。  
背景の見え方はポータルと揃えるため、`index.html` と `TemplateData/style.css` の両方で背景指定を持たせています。

## ローカル開発

```bash
npm install
npm run dev
```

起動後:

- ポータル: `http://localhost:3000/`
- ゲーム: `http://localhost:3000/games/whack-a-devilyagiakyo/`

## デプロイ

- ホスティング先: Vercel
- 通常運用: `devlop` で作業し、必要に応じて `main` へ反映
- Brotli配信設定: `vercel.json`（Unity Build の `.br` 配信ヘッダー/rewrites）
