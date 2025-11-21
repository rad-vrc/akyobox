# Akyobox (Whack-a-Akyo Portal)

「悪夜」テーマの Unity WebGL ゲームを Next.js 16 (App Router) で配信するポータルです。現在は **whack-a-devilyagiakyo** を掲載中。

---
## 技術スタック
- Next.js 16 (App Router) / TypeScript
- Unity 6 WebGL ビルド（Brotli圧縮）
- Vercel（ホスティング、KV）
- フォント: 推しゴ (`/fonts/oshigo.otf`) を全UIに適用

## 機能ハイライト
- Unity WebGL を `iframe` で埋め込み（`app/page.tsx`）
- 背景動画（タイトル/ゲーム/エンディング）は絶対パスでプリロードし、キャンバス背面に再生
- ランキング TOP10：Vercel KV に保存、同一ユーザーはベストスコアのみ保持（大小文字を無視して重複排除）
- モバイル最適化：`config.devicePixelRatio = 1`、Brotli配信ヘッダーを強化
- 名前入力・ランキングUIは WebGL オーバーレイ（テンプレートと `public` 両方に同実装）

## ディレクトリ
- `app/page.tsx` … 入口。右上に「Akyobox」ヘッダー（推しゴ）、`iframe` でゲームを表示
- `app/api/highscores/route.ts` … ランキング API（Edge Runtime, Vercel KV）
- `public/games/whack-a-devilyagiakyo/` … Unity ビルド一式と動画 (`title.mp4`, `game-bg.mp4`, `ending.mp4`)
- `Unity/whack-a-devilyagiakyo/Assets/WebGLTemplates/YourTemplate/` … Unity ビルドテンプレート（オーバーレイUI・動画パス・フォント指定を保持）
- `next.config.mjs` / `vercel.json` … `.br` への `Content-Encoding` / `Content-Type` / キャッシュヘッダー（immutable, no-transform）

## 環境変数（Vercel）
| KEY | 用途 |
| --- | --- |
| `KV_REST_API_URL` | Upstash / Vercel KV |
| `KV_REST_API_TOKEN` | 同上 |
| `KV_REST_API_READ_ONLY_TOKEN` | 同上 |
| (任意) `GAME_SECRET` | 現在未使用（署名検証は無効化済） |

## セットアップ
```bash
npm install        # 依存インストール
npm run dev        # http://localhost:3000
npm run lint       # Lint
npx tsc --noEmit   # 型チェック
npm run build      # 本番ビルド
```

## デプロイ（Vercel）
1. 上記環境変数を Vercel に設定
2. `npm run build` で通ることを確認
3. `vercel --prod` あるいは Git 連携でデプロイ
   - Brotliヘッダーは `next.config.mjs` / `vercel.json` により自動付与
   - 動画/ビルドパスは絶対パス指定済みのため iframe でも解決ずれなし

## Unity ビルド手順メモ
1. Unity プロジェクト（ローカル `D:\Unity\whack-a-devilyagiakyo`）で WebGL ビルドターゲットを選択
2. テンプレートを `YourTemplate` に設定（オーバーレイUI・絶対パス・推しゴ）
3. 出力先を `public/games/whack-a-devilyagiakyo/` に上書き
4. Brotli圧縮を有効化（.wasm.br, .js.br, .data.br）

### Unity側ローカル変更（リポジトリ外）
- 残30秒でスポーン速度2倍、第2段階で残15秒でもう2倍（計4倍）
- サイレンSE（30秒/15秒の2段階）
- テレグラフ演出（出現前に膨らみ）
- コンボボーナス（1秒以内連続ヒットで倍率加算）
※ Unity フォルダは `.gitignore`。再ビルド時に `public/games/...` を差し替えれば反映。

## ランキングAPI 仕様
- `GET /api/highscores` … TOP10 を返却（降順）。KVの ZSET メンバーはユーザーキー（小文字）で一意。
- `POST /api/highscores` … `{ name, score }` を保存。既存より低いスコアは無視。  
  - 文字は制御文字/<>を除去し、空や全除去なら `"Anonymous"`。
  - 保存は `highscores-by-user` (Hash) + `highscores` (ZSET) にベストスコアのみ。

## 既知の注意 / トラブルシュート
- モバイルで動画/Unityが出ない: デプロイ後に CF プロキシを使う場合は一度 DNS only で確認。キャッシュをパージ。
- Brotli 404/デコード失敗: `next.config.mjs` のパターン修正済み。`.br` に `Content-Encoding: br` が付くかレスポンスヘッダーで確認。
- 名前ハイライト: 大文字小文字は無視して照合。

## デザイン・フォント
- 推しゴを `@font-face` で読み込み、オーバーレイUIとヘッダーに適用。
- ラベル/入力/ランキングは大きめのサイズでユニバーサルデザインを意識。

## コミット状況
- 最新ブランチ: `feature/game-logic`
- 直近コミット: `e8725580`（ランキング強調のケース無視）。
