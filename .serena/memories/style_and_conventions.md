# スタイル・規約
- フロント: Next.js 16 + TypeScript。App Router 構成（`app/`）。
- ESLint: `eslint-config-next` 標準。any 追加は避ける。
- 命名: 英語・キャメルケース/パスカルケースを Next/React 標準に合わせる。
- Unity アセット: 公開用は非圧縮 (.data/.wasm/.js) で配置し、vercel.json の Content-Type 設定に合わせる。
- パス: 動画/フォントは絶対パス `/games/whack-a-devilyagiakyo/...` で参照（iframe 起点差異を避ける）。
- 禁止事項: PowerShell での直接コード編集（Get-Content/Set-Content等）は禁止。編集は `apply_patch` 等の安全手段で。