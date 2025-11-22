# Akyobox / 激烈!!デビルヤギAkyo叩き

Next.js 16 (App Router) で Unity WebGL ゲーム「whack-a-devilyagiakyo」を配信するポータル。ゲーム本体は `public/games/whack-a-devilyagiakyo` のビルド成果物をそのまま配信する構成。

---

## 全体構成

- フロント: Next.js 16 / TypeScript（App Router）
- ゲーム: Unity 6 WebGL ビルド（テンプレート `YourTemplate` を使用）
- ホスティング: Vercel（KV でランキング保存）
- フォント: 推しゴ（`/fonts/oshigo.otf`）を全 UI に適用
- ブランチ: `feature/game-logic`

---

## ディレクトリ

- `app/page.tsx` … 入口ページ。右上にヘッダー「激烈!!デビルヤギAkyo叩き」、`iframe` で WebGL を埋め込み。
- `app/api/highscores/route.ts` … ランキング API（Edge Runtime, Vercel KV）。
- `public/games/whack-a-devilyagiakyo/` … Unity 出力一式と動画 (`title.mp4`, `game-bg.mp4`, `ending.mp4`)。
- `Unity/whack-a-devilyagiakyo/Assets/WebGLTemplates/YourTemplate/` … Unity ビルドテンプレート（オーバーレイ UI / 絶対パス / 推しゴ指定）。※ git ignore のためローカルのみ。
- `vercel.json` … Unity ビルドファイル用ヘッダー（Content-Type / immutable cache）。現在は **非圧縮配信** に切り替え済み（`.br` なし）。

---

## 現在の挙動・パラメータ（Unity 側）

※ Unity プロジェクトは `D:\Unity\whack-a-devilyagiakyo`（リポジトリ外）。再ビルド時は同じ設定を維持してください。

- スポーン倍率（固定）  
  - 60〜30秒: 3x, 30〜15秒: 6x, 15〜0秒: 12x  
  - 当たり:ハズレ ≈ 2:1（targetProbability ≈ 0.66）、waveCountMultiplier = 2
- イントロ演出: 開始前 10 秒をイントロ BGM＋テキスト（ノイズ演出）で再生。イントロ中はタイマー・スポーン停止。
- サイレン SE: 残り30秒 / 15秒で順に鳴動。
- コンボ: ゲーム終了でリセット。
- サウンド管理: GameManager が BGM 1ch ＋ SE 8ch プール（途切れ防止）。終了直後は resultIntroSfx、リザルト画面で resultBgm。
- 動画 / フォントパスは絶対パスで統一（iframe でも崩れない）。

---

## ランキング API 仕様（/api/highscores）

- GET: TOP10 降順を返す。ZSET メンバーは `userKey = sanitize(name).toLowerCase() + ':' + anonId` で一意。
- POST: `{ name, score, anonId? }`  
  - 制御文字 / `< >` を除去。空になった場合は `"Anonymous"`。  
  - 既存スコアより低い場合は無視。  
  - KV: `highscores-by-user` (Hash) に JSON、`highscores` (ZSET) にベストスコアのみ。
- 署名検証は現在オフ（クライアント側ハッシュ未実装のため）。

---

## フロントエンド備考

- 推しゴを `@font-face` で読み込み、入力・ランキング・ヘッダーに適用。
- ラベル/入力は大きめで UD を意識（ランキングは TOP10 表示）。
- 動画プリロードは絶対パス (`/games/whack-a-devilyagiakyo/*.mp4`)。
- ルート（`/`）もゲームページ（`/games/whack-a-devilyagiakyo/`）も同じOG/Twitterカード設定。画像は `https://akyobox.vercel.app/apple-icon.png`。共有時は `summary_large_image` で表示される。

---

## 開発コマンド

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run build      # 本番ビルド
npx tsc --noEmit   # 型チェック
```

---

## デプロイ手順（Vercel）

1) 環境変数（すべて Vercel に登録）

| KEY                           | 用途              |
| ----------------------------- | ----------------- |
| KV_REST_API_URL               | Vercel KV         |
| KV_REST_API_TOKEN             | 同上              |
| KV_REST_API_READ_ONLY_TOKEN   | 同上              |
| KV_URL (互換用)               | 同上              |

2) `npm run build` が通ることを確認  
3) Git push で自動デプロイ or `vercel --prod`

### 配信ヘッダー（非圧縮で運用）

- `vercel.json` で `/games/whack-a-devilyagiakyo/Build/*.data|*.wasm|*.js` に Content-Type を付与し、`Cache-Control: public, max-age=0, must-revalidate, no-transform` で常に再検証。  
- **Content-Encoding は付けない**（非圧縮ファイルのみ配信）。`.br` は置かない。  
- もし誤って `.br` を置くと wasm 破損で `both async and sync fetching of the wasm failed` になるので注意。

---

## Audio/BGM 管理メモ
- BGM/SE は GameManager に一元化。BGM 1ch + SE 8ch プール（途切れ防止）。
- 設定画面の BGM スライダーは GameManager の `SetBgmVolume` / `GetBgmVolume` を呼ぶよう修正済み。
- イントロ中はカウント停止＆スポーン停止。終了後にゲームBGMへフェードなしで切替。
- 終了直後は `resultIntroSfx`、リザルト画面で `resultBgm` を再生。

---

## Unity ビルド時のチェックリスト

1. テンプレート: `YourTemplate` を選択（オーバーレイ UI・推しゴ・絶対パス）。
2. 出力先: `public/games/whack-a-devilyagiakyo/` に上書きコピー。  
   - 必要ファイル: `.data`, `.wasm`, `.framework.js`, `.loader.js`, `index.html`, `Videos/*.mp4`
3. 圧縮: 現状 **圧縮しない**（`.br` を出力しない設定にするか、出力後に .br を削除）。
4. ビルド後、`public` 側とテンプレート側で動画/フォント/パスの差異がないか確認。

---

## トラブルシュート

- wasm がロードできない / `Import requires a callable` など  
  → .br が混入していないか確認。`public/games/.../Build` 内に `.br` が残っていれば削除し、`vercel.json` は非圧縮用になっていることを確認。
- 画面が真っ黒 / 動画が出ない  
  → 動画パスが相対になっていないか確認（絶対パス必須）。テンプレートと `public` の両方を同じ記述に。
- エンディング動画がループする  
  → テンプレと `public` 両方の `bgVideo` に `loop` 属性が残っていないか確認。JS の `swapVideo` で `removeAttribute("loop")` する版をビルド成果物に反映する。
- ランキングに名前が反映されない  
  → 文字列が空 or 制御文字のみの場合 `"Anonymous"` にフォールバック。KV 側キー衝突がないか（anonId を付ける）。

---

## CI

- GitHub Actions: `tsc`, `eslint`, `knip`（デッドコード）を実行。`next build` で本番相当チェック。

---

## 最近の変更（要約）

- Unity ビルドを **非圧縮配信** に切替（wasm Import エラーを解消）。
- `vercel.json` を非圧縮ヘッダーに更新。
- テンプレート / public の `index.html` で `.br` 参照を排除。動画・フォントは絶対パス維持。
- スポーン倍率とサウンド管理は GameManager に集約（BGM/SE の途切れ防止、コンボリセット、サイレン SE）。
- 第2サイレン時に TextMeshPro UI を5秒表示できるフィールド `secondSirenText` を GameManager に追加（Scene でアサイン必須）。
- エンディング動画ループ対策：`bgVideo` の `loop` 属性を外し、`swapVideo` で非ループ時に `removeAttribute("loop")` を実行するよう統一。
