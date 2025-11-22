# プロジェクト概要
- 目的: Next.js 16 (App Router) サイト上で Unity WebGL ゲーム「whack-a-devilyagiakyo」を配信し、KV でハイスコア管理を行う。
- 配置: Unity ビルド成果物は `public/games/whack-a-devilyagiakyo/` 配下（.data/.wasm/.js は非圧縮で配信、vercel.json で Content-Type 設定）。
- バックエンド/ランキング: Vercel KV を使用（`@vercel/kv`）。
- デプロイ: Vercel。Node >= 20.9 が必須（Next 16）。
- 主要ディレクトリ: `app/` (Next.js アプリ), `public/games/...` (Unity アセット), `Unity/` シンボリックリンクで実プロジェクト D:\Unity を参照。
- ビルド設定: vercel.json で Brotli 無効化し、拡張子別 Content-Type 付与。CI/Lint は eslint + knip（dead code）。
