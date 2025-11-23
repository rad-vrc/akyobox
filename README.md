# AkyoBox (激烈!!デビルヤギAkyo叩き)

このリポジトリは、Unity製WebGLゲーム「激烈!!デビルヤギAkyo叩き」を公開するための Next.js ポータルサイトです。
ゲーム本体（Unity WebGL）と、ランキングシステム（Next.js API + Vercel KV）を統合して動作させています。

## 🚀 プロジェクト概要

- **サイトURL**: [https://akyobox.vercel.app](https://akyobox.vercel.app)
- **フレームワーク**: Next.js 16 (App Router)
- **ゲームエンジン**: Unity 6
- **データベース**: Vercel KV (Redis) - ハイスコア保存用
- **ホスティング**: Vercel

## 📂 ディレクトリ構成

```text
D:\akyobox\
├── app/                  # Next.js アプリケーションコード
│   ├── api/highscores/   # ハイスコア用API (GET/POST)
│   └── page.tsx          # トップページ
├── public/               # 静的ファイル (Unityビルドの配置場所)
│   ├── fonts/            # フォントファイル
│   └── games/
│       └── whack-a-devilyagiakyo/  # ★ここにUnityのビルド結果を出力
├── Unity/                # Unityプロジェクトのソースコード
│   └── whack-a-devilyagiakyo/
│       └── Assets/WebGLTemplates/  # ★カスタムWebGLテンプレート
└── vercel.json           # Vercel設定 (Brotli圧縮ヘッダー等)
```

---

## 🎮 Unity開発・ビルドフロー

このプロジェクトは、Unityのビルド設定に**独自のWebGLテンプレート**を使用しています。これにより、以下の最適化が自動的に適用されます。

1.  **高解像度モニター対策**: `devicePixelRatio` を強制的に `1` に制限し、4K/Retina環境でのFPS低下を防ぎます。
2.  **GPU強制モード**: `powerPreference: "high-performance"` を設定し、省電力GPUではなく高性能GPUの使用をブラウザに促します。
3.  **UI統合**: ゲーム画面外のHTMLオーバーレイ（ランキング、名前入力）との連携スクリプトが含まれています。

### ビルド手順

1.  Unityで `Unity/whack-a-devilyagiakyo` プロジェクトを開く。
2.  **Build Settings** > **Player Settings** > **Resolution and Presentation** を開く。
3.  **WebGL Template** で **`YourTemplate`** が選択されていることを確認する。
    *   *重要: `Default` テンプレートでビルドすると、FPS対策やランキング機能が消失します。*
4.  ビルド出力先を `D:\akyobox\public\games\whack-a-devilyagiakyo` に指定してビルド実行。

> **注意**: `Assets/WebGLTemplates/YourTemplate/index.html` がこのサイトの心臓部です。JavaScriptロジックを変更する場合は、必ずこのテンプレートファイルを編集してください。

---

## 🏆 ハイスコアシステム (Vercel KV)

サーバーレスRedis (Vercel KV) を使用して、プレイヤーのスコアを管理しています。

### アーキテクチャ更新履歴 (2025/11/23)
初期の実装では `HSET` (Hash) を使用していましたが、特定の環境下でデータが `[object Object]` と化して保存される不具合が発生したため、**単純な `SET` (Key-Value) 方式**に移行しました。

### データ構造
*   **ランキング順序**: Redis Sorted Set (`zadd`)
    *   Key: `highscores`
    *   Member: `name:ユーザー名`
*   **詳細データ**: Redis String (`set`)
    *   Key: `detail:name:ユーザー名`
    *   Value: JSON String `{"name": "...", "score": 1234, "at": ...}`

### API仕様 (`/api/highscores`)
*   **GET**: トップ10のスコアリストを取得します。
    *   `dynamic = "force-dynamic"` によりキャッシュを無効化し、常に最新データを返します。
    *   万が一データ不整合（ランキングにあるのに詳細がない等）があった場合、自動的にクリーニングを行う自己修復機能を搭載しています。
*   **POST**: スコアを送信します。
    *   **ハイスコア更新ロジック**: サーバー上の既存スコアと比較し、新しいスコアが高い場合のみ上書き保存します。

---

## ⚡ パフォーマンス最適化設定

### 1. 圧縮配信の設定について
現在、Unity側では**非圧縮 (Disabled)** でビルドされていますが、将来的にロード時間を短縮するために **Brotli圧縮** を有効にした場合でも即座に対応できるよう、`vercel.json` には既に `.br` ファイル用のヘッダー設定が記述されています。
（Unityで圧縮設定を変更しても、Vercel側の設定変更は不要です）

### 2. 背景動画の負荷軽減
背景に `video` タグ、手前に `canvas` (Unity) を配置しています。
Unity側で「背景を透明」にしていますが、これは描画負荷が高いため、前述の `devicePixelRatio: 1` 制限が必須となっています。

---

## 🛠️ ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

http://localhost:3000 にアクセスすると、ローカルでゲームとランキング機能（Vercel KVへの接続設定が `.env` にあれば）を確認できます。