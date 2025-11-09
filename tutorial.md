# Akyobox プロジェクト構成チートシート

このドキュメントは、現在の Akyobox (Vite + React + TypeScript) プロジェクト内の主要ファイルとディレクトリの役割を一覧で整理したものです。セットアップや調査時に参照してください。

## ルート直下のファイル
- `package.json`: プロジェクト名、依存関係、`dev`/`build`/`lint`/`preview` などの npm スクリプトを宣言する中核マニフェスト。CI や環境構築はここを基準に動く。
- `README.md`: プロジェクトの概要とデプロイ手順を記載。初見の開発者がコンテキストを得る入口。
- `tutorial.md` (本書): ファイル役割の補足資料。
- `index.html`: Vite が配信する単一 HTML。`<div id="root">` を用意し、`/src/main.tsx` をエントリースクリプトとして読み込む。
- `.gitignore`: Git で無視する生成物 (`node_modules`, `dist` など) を定義しリポジトリをクリーンに保つ。
- `vite.config.ts`: Vite のビルド／開発サーバ設定。現在は React プラグインを読み込むのみだが、環境変数やエイリアス設定をここに追記する。
- `tsconfig.json`: TypeScript のプロジェクト参照定義。アプリ用 (`tsconfig.app.json`) とツール用 (`tsconfig.node.json`) を束ねる親設定。
- `tsconfig.app.json`: ブラウザ向けコードのコンパイルオプション。`jsx: react-jsx`、`strict` モードなどを有効化し、`src` 配下を対象にする。
- `tsconfig.node.json`: Vite 設定や Node 実行ファイル用の TS 設定。`vite.config.ts` の型チェック専用に軽量な lib セットを指定。
- `tsconfig.node.json` とセットで `tsc -b` がビルド時に用いる参照グラフを形成する。
- `eslint.config.js`: ESLint のルール定義。TypeScript/React Hooks/React Refresh プラグインをまとめ、`dist` を lint 対象から除外している。

## ディレクトリ
- `src/`: アプリ本体のソース。React コンポーネント、スタイル、型定義などはここに置く。
  - `main.tsx`: ブラウザ起動時のエントリーポイント。`ReactDOM.createRoot` で `App` を `#root` に描画し、`StrictMode` でデベロッパ体験を向上させる。
  - `App.tsx`: 画面構成のサンプルコンポーネント。ロゴ表示とカウンタ機能が含まれ、学習用に `useState` や HMR を試せる。
  - `index.css`: 全体スタイルやカスタム CSS 変数を定義。共通テーマをここで管理し `main.tsx` から取り込む。
  - `App.css`: `App` コンポーネント固有の装飾。ボタン、ロゴアニメーションなど局所的なスタイルを担当。
  - `assets/`: 画像や静的アセット（例: `react.svg`）。Vite が ESM として扱い、`import` で参照可能。
  - `vite-env.d.ts`: Vite 固有の型補完を提供する宣言ファイル。`import.meta.env` などの型情報を TypeScript に伝える。
- `public/`: ビルド時にそのままコピーされる静的ファイル置き場。`favicon` や公開用の `robots.txt` 等を配置する。現在は Vite 既定の `vite.svg` などが想定される。
- `node_modules/` (生成物): `npm install` 後に作成される依存パッケージ群。ソース管理対象外。
- `dist/` (生成物): `npm run build` で出力される最適化済み成果物。デプロイ対象であり、手動編集はしない。

## スクリプトとタスク
- `npm run dev`: Vite 開発サーバを `http://localhost:5173` で起動し、HMR を有効にする。
- `npm run build`: `tsc -b` で型チェック → Vite 本番ビルドを実行。`dist` に ES Modules を生成。
- `npm run preview`: `dist` をローカル配信してデプロイ前の挙動を確認。
- `npm run lint`: `eslint.config.js` に基づき `src`/`vite.config.ts` を静的解析する。

## 運用メモ
1. 依存追加時は `package.json` とロックファイルを必ずコミットし、`README.md` に導入手順の差分を追記する。
2. TypeScript 設定を変更する場合は `tsconfig.app.json` と `tsconfig.node.json` の両方に影響がないか確認する。
3. ビルド生成物 (`dist`, `node_modules`) は `.gitignore` で管理済み。リポジトリに含めない。

必要に応じて本ドキュメントにファイルを追記して、チーム内で構成への理解を共有してください。
