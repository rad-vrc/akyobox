# タスク完了チェック
- 変更後は必要に応じて `npm run lint`（最低限）を実行。型エラーは build 時に捕捉。
- 依頼内容に Unity ビルドが絡む場合は、Unity 側でビルド後 `public/games/whack-a-devilyagiakyo/` へコピーすることを明記する。
- Brotli 圧縮ファイルを置かない（.br 不要）。vercel.json の Content-Type ルールに従う。
- 必要なら dead code チェック `npm run deadcode` を補助的に実行。
- デプロイは Vercel（Node >=20.9 前提）。