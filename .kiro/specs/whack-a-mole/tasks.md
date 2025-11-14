# Implementation Plan - 激烈！デビルヤギAkyo叩き

## アセット準備チェックリスト

実装開始前に以下の画像ファイルが`public`ディレクトリに配置されていることを確認：
- ✓ `GameTitle.png` - ゲームタイトルロゴ（既存）
- ✓ `akyo_devilyagi.png` - 正解画像（既存）
- `akyo_humanoid.png` - デフォルトはずれ画像1（必要に応じて作成）
- `akyo_yagi.png` - デフォルトはずれ画像2（必要に応じて作成）
- `fallback.png` - エラー時のフォールバック画像（CIで必須チェック対象）

## localStorage設計仕様

**キー名:** `customDecoyImages`
**形式:** JSON配列 `[string, string]`（Base64エンコードされた画像データ）
**容量制限:** 各画像5MB以下（合計10MB以下を推奨）
**バリデーション:** 
- 対応形式: image/png, image/jpeg, image/webp, image/gif
- サイズ上限: 5MB/ファイル

## テスト戦略タイムライン

**段階1: 単体テスト（実装と並行）**
- Task 1完了時: ユーティリティ関数のテスト
- Task 6-8完了時: コンポーネントロジックとゲームロジックのテスト
- Task 11完了時: localStorage操作のテスト

**段階2: 統合テスト（コア機能完成後）**
- Task 9完了時: ゲームフロー全体の統合テスト

**段階3: E2Eテスト（最終段階）**
- Task 16: ブラウザ横断テスト、パフォーマンステスト、エッジケーステスト

## Tasks

- [ ] 1. プロジェクト基盤とデータモデルの作成
  - `src/types.ts`を作成してTypeScript型定義（AkyoData、GameConfig、コンポーネントProps）
  - `src/constants.ts`を作成してゲーム設定の定数を定義
  - `src/utils.ts`を作成してユーティリティ関数を実装（位置生成、距離計算）
  - テスト基盤として Vitest を導入 (`npm install -D vitest @vitest/ui jsdom`)、`vitest.config.ts` と `src/setupTests.ts` を作成し、ユニットテスト用の共通設定を整備
  - _Requirements: 1.1, 2.1, 2.2, 2.5, 3.1, 3.2_
  - **チェックポイント:** 型定義がエラーなくコンパイルでき、ユーティリティ関数が期待通りの値を返し、`npm run test` (Vitest) が成功すること

- [ ] 2. 基本的なゲーム状態管理の実装
  - App.tsxにゲーム状態管理のロジックを追加（useState、useEffect）
  - ゲーム状態（start/playing/gameover/settings）の切り替えロジック
  - スコアとタイマーの状態管理
  - 開発用デバッグ表示を追加（現在の状態、スコア、残り時間）
    - 環境変数`VITE_DEBUG=true`で表示/非表示を切り替え
    - `src/vite-env.d.ts`に `interface ImportMetaEnv { readonly VITE_DEBUG: string }` を追記して型安全にアクセス
    - 本番ビルドでは自動的に非表示
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2_
  - **チェックポイント:** 状態遷移が正しく動作し、最低限のゲームループ（開始→プレイ中→終了）が成立し、`import.meta.env.VITE_DEBUG` を通じたデバッグ制御がビルド時に型チェックされること
  - **デバッグ表示の扱い:** Task 13（デプロイ設定）で環境変数を設定し、本番では非表示にする

- [ ] 3. GameTitleコンポーネントの実装
  - GameTitle.tsxを作成
  - GameTitle.png画像を表示
  - タイトルのスタイリング
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 4. StartScreenコンポーネントの実装
  - StartScreen.tsxを作成
  - スタートボタンと設定ボタンのUI
  - ボタンクリックイベントハンドラー
  - スタート画面のスタイリング
  - _Requirements: 1.1, 7.2_

- [ ] 5. GameScreenコンポーネントの実装
  - GameScreen.tsxを作成
  - ScoreDisplayコンポーネント（得点表示）
  - TimerDisplayコンポーネント（残り時間表示）
  - GameBoardコンポーネント（Akyo表示エリア）
  - ゲーム画面のレイアウトとスタイリング
  - _Requirements: 1.3, 4.1, 4.2_

- [ ] 6. AkyoItemコンポーネントの実装
  - `src/components/AkyoItem.tsx`を作成
  - Akyo画像の表示とランダム位置配置（position: absolute）
  - クリックイベントハンドラー
  - 出現アニメーション（pop-in）
  - クリック時のアニメーション（hit）
  - 画像読み込みエラーハンドリング（onErrorでfallback画像表示）
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2_
  - **チェックポイント:** Akyoが画面上のランダムな位置に表示され、クリックで消えることを確認
  - **単体テスト（このタスク完了時に実施）:** クリックイベントが正しく発火し、正解/不正解の判定が正確か確認

- [ ] 7. Akyo生成ロジックの実装
  - `src/hooks/useAkyoSpawner.ts`カスタムフックを作成（オプション）
  - ランダムな間隔でAkyoを生成する関数（1-2秒間隔）
  - 正解/不正解のランダム選択ロジック（50%確率）
  - 最大表示数の制限（3個まで）
  - 自動削除タイマー（1.5秒後）
  - 位置の重複チェック（最小距離150px）
  - _Requirements: 2.1, 2.2, 2.5_
  - **チェックポイント:** Akyoが適切な間隔で生成され、重複せず、自動的に消えることを確認
  - **単体テスト（このタスク完了時に実施）:** 位置生成関数が重複を避け、範囲内の値を返すことを確認

- [ ] 8. 得点計算とタイマーロジックの実装
  - Akyoクリック時の得点計算関数
  - 正解時の加点（+10点）
  - 不正解時の減点（-5点、最小0点）
  - カウントダウンタイマーの実装（useEffectで1秒ごと）
  - タイマー終了時のゲームオーバー処理
  - タイマーとインターバルの適切なクリーンアップ
  - _Requirements: 1.2, 1.3, 1.4, 2.3, 2.4, 3.1, 3.2, 3.3, 4.2_
  - **チェックポイント:** 得点が正しく計算され、30秒後に自動的にゲームオーバーになることを確認
  - **単体テスト（このタスク完了時に実施）:** 得点計算ロジックが境界値（0点未満にならない）を正しく処理することを確認

- [ ] 9. GameOverScreenコンポーネントの実装
  - `src/components/GameOverScreen.tsx`を作成
  - 最終得点の表示
  - リスタートボタンのUI
  - リスタート時の状態リセット
  - ゲームオーバー画面のスタイリング
  - _Requirements: 1.4, 4.3, 5.1, 5.2, 5.3_
  - **統合テスト（このタスク完了時に実施）:** ゲーム開始→プレイ→終了→リスタートの完全なフローが正常に動作することを確認

- [ ] 10. SettingsScreenコンポーネントの実装
  - `src/components/SettingsScreen.tsx`を作成
  - 現在のはずれ画像の表示（2つのスロット）
  - ファイルアップロードUI（input type="file" accept="image/*"）
  - 画像ファイルのバリデーション（形式: png/jpeg/webp/gif、サイズ: 5MB以下）
  - プレビュー機能（アップロード前に画像を確認）
  - 戻るボタンのUI
  - 設定画面のスタイリング
  - _Requirements: 6.1, 6.2, 6.3_
  - **チェックポイント:** 画像をアップロードしてプレビューが表示され、バリデーションエラーが適切に表示されることを確認

- [ ] 11. カスタム画像管理機能の実装
  - `src/utils/imageStorage.ts`を作成
  - FileReader APIを使用した画像読み込み（readAsDataURL）
  - Base64エンコーディング
  - localStorageへの保存（キー: `customDecoyImages`、形式: JSON配列）
  - アプリ起動時のカスタム画像読み込み（useEffect）
  - localStorageエラーハンドリング（容量超過、アクセス拒否）
  - 容量チェック（5MB/ファイル、合計10MB推奨）
  - _Requirements: 6.3, 6.4, 6.5_
  - **チェックポイント:** カスタム画像を保存し、ページをリロードしても画像が保持されることを確認
  - **単体テスト（このタスク完了時に実施）:** localStorage保存/読み込み関数が正しく動作し、エラー時に適切にフォールバックすることを確認

- [ ] 12. レスポンシブデザインとスタイリングの実装
  - グローバルスタイルの設定（App.css）
  - モバイル対応のメディアクエリ
  - フルスクリーンレイアウト
  - アニメーションの定義（pop-in、hit）
  - 各コンポーネントのCSSファイル作成
  - _Requirements: 全体的なUI/UX_

- [ ] 13. Vercelデプロイ設定
  - vercel.jsonファイルの作成（SPAルーティング設定）
  - package.jsonのビルドスクリプト確認
  - 画像ファイルのpublicディレクトリ配置確認
  - 環境変数の設定（`VITE_DEBUG=false`を本番環境に設定）
  - デプロイ前のローカルビルド確認（`npm run build && npm run preview`）
  - _Requirements: デプロイメント_
  - **チェックポイント:** ローカルでプロダクションビルドが正常に動作し、デバッグ表示が非表示になることを確認

- [ ] 14. パフォーマンス最適化と画像読み込み戦略
  - **コンポーネント最適化:**
    - React.memoでコンポーネントをメモ化（AkyoItem、ScoreDisplay、TimerDisplay）
    - useCallbackでイベントハンドラーをメモ化（onAkyoClick、onStart、onRestart）
    - useMemoで計算コストの高い値をメモ化（必要に応じて）
  - **リソース管理:**
    - タイマーとインターバルのクリーンアップ確認（useEffectのreturn）
    - 画像の最適化（WebP形式推奨、適切なサイズに圧縮）
  - **画像読み込み戦略（具体的な実装箇所）:**
    - **プリロード（index.html）:**
      ```html
      <link rel="preload" href="/GameTitle.png" as="image">
      <link rel="preload" href="/akyo_devilyagi.png" as="image">
      ```
    - **遅延読み込み（App.tsx）:**
      - useEffectでゲーム状態が'playing'になったタイミングで、はずれ画像をプリロード
      - 新しいImage()オブジェクトを作成してsrcを設定することで、ブラウザキャッシュに読み込む
      ```typescript
      useEffect(() => {
        if (gameState === 'playing') {
          decoyImages.forEach(src => {
            const img = new Image();
            img.src = src;
          });
        }
      }, [gameState, decoyImages]);
      ```
    - **カスタム画像（SettingsScreen.tsx）:**
      - アップロード時にプレビュー表示することで、自動的にキャッシュに読み込まれる
  - _Requirements: パフォーマンス_
  - **チェックポイント:** 
    - React DevTools Profilerで不要な再レンダリングがないことを確認
    - Network タブで画像が適切にプリロードされていることを確認
  - **パフォーマンステスト:** 複数のAkyoが同時表示されても60FPSを維持できることを確認

- [ ] 15. アクセシビリティの実装
  - キーボード操作のサポート（Enterで開始、SpaceでAkyo叩き、Escapeで設定画面を閉じる）
  - 主要ボタンや情報表示に適切なARIAラベルを追加（例: score表示は `aria-live="polite"`）
  - フォーカスインジケーターとタブ順を定義し、モーダル表示時はフォーカストラップを実装
  - スクリーンリーダー向けに視覚情報をテキスト化（ヒット/ミス時の通知など）
  - _Requirements: アクセシビリティ_

- [ ] 16. エンドツーエンドテストと最終検証
  - **基本フローテスト:**
    - ゲーム開始 → Akyo叩き → 得点獲得 → タイマー終了 → リスタート
    - 設定画面 → 画像アップロード → 保存 → ゲームで反映確認
  - **ブラウザ互換性テスト:**
    - Chrome（最新版）
    - Firefox（最新版）
    - Safari（最新版、macOS/iOS）
    - Edge（最新版）
  - **モバイル対応テスト:**
    - iOS Safari（iPhone）
    - Android Chrome（Android端末）
    - タッチ操作の動作確認
    - レスポンシブレイアウトの確認
  - **パフォーマンステスト:**
    - 5分間連続プレイでメモリリークがないことを確認（Chrome DevTools Memory Profiler）
    - 複数Akyo同時表示時のフレームレート確認
  - **エッジケーステスト:**
    - localStorage無効時の動作
    - 画像読み込み失敗時のフォールバック
    - 極端に大きい画像のアップロード
  - _Requirements: 全要件_
  - **最終チェックポイント:** すべての要件が満たされ、主要ブラウザで問題なく動作することを確認
