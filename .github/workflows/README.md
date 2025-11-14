# GitHub Actions ワークフロー

このディレクトリには、プロジェクトのCI/CDパイプラインを構成するGitHub Actionsワークフローが含まれています。

## ワークフロー一覧

### 1. CI (`ci.yml`)
**トリガー:** プルリクエスト作成・更新時、main/developブランチへのプッシュ時

**実行内容:**
- TypeScript型チェック
- ESLintによるコード品質チェック
- プロダクションビルド
- デバッグコード検出
- 必須アセットの確認
- ビルドサイズ分析

**目的:** コードの品質を保ち、ビルドエラーを早期に検出

---

### 2. Deploy Ready Check (`deploy-check.yml`)
**トリガー:** 
- mainブランチへのプルリクエスト時（自動）
- 手動実行（Actions タブから）

**実行内容:**
1. ✅ ビルドチェック - プロダクションビルドが成功するか
2. ✅ アセット確認 - 必要な画像ファイルがすべて存在するか
3. ✅ コード品質 - リント・型チェックをパス
4. ✅ デバッグコード - console.logやデバッグフラグが残っていないか
5. 📊 ビルドサイズ分析 - 最適化が必要かチェック

**目的:** デプロイ前の総合的な品質チェック（Kiroの手動フックと同等）

---

### 3. Vercel Deploy (`vercel-deploy.yml`)
**トリガー:** mainブランチへのプッシュ時

**実行内容:**
1. デプロイ前検証（リント、型チェック、ビルド、アセット確認）
2. Vercelへの自動デプロイ

**目的:** mainブランチの変更を自動的に本番環境にデプロイ

**必要な設定:**
GitHubリポジトリのSecretsに以下を追加:
- `VERCEL_TOKEN` - Vercelのアクセストークン
- `VERCEL_ORG_ID` - VercelのOrganization ID
- `VERCEL_PROJECT_ID` - VercelのProject ID

---

## セットアップ手順

### 1. GitHubリポジトリの作成
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Vercel連携の設定（オプション）

Vercelへの自動デプロイを有効にする場合:

1. [Vercel](https://vercel.com)でプロジェクトをインポート
2. Vercel CLIでトークンを取得:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```
3. プロジェクト情報を取得:
   ```bash
   cat .vercel/project.json
   ```
4. GitHubリポジトリの Settings > Secrets and variables > Actions で以下を追加:
   - `VERCEL_TOKEN`: Vercelダッシュボード > Settings > Tokens で生成
   - `VERCEL_ORG_ID`: `.vercel/project.json`の`orgId`
   - `VERCEL_PROJECT_ID`: `.vercel/project.json`の`projectId`

### 3. ワークフローの確認

プルリクエストを作成すると、自動的にCIとDeploy Ready Checkが実行されます。

手動でDeploy Ready Checkを実行する場合:
1. GitHubリポジトリの「Actions」タブを開く
2. 「Deploy Ready Check」を選択
3. 「Run workflow」をクリック

---

## ローカル開発との連携

これらのワークフローは、Kiroのフックと同じチェックを実行します:

| Kiroフック | GitHub Actions |
|-----------|----------------|
| ゲームコンポーネント保存時の自動テスト | `ci.yml` (test job) |
| デプロイ準備チェック（手動） | `deploy-check.yml` |

ローカルでKiroフックを使用し、プルリクエスト時にGitHub Actionsで再検証することで、二重の品質保証が実現できます。

---

## トラブルシューティング

### ワークフローが失敗する場合

**型エラー:**
```bash
npm run build
```
をローカルで実行して、エラーを修正

**リントエラー:**
```bash
npm run lint
```
をローカルで実行して、エラーを修正

**アセット不足:**
`public/`ディレクトリに必要な画像ファイルを配置

**デバッグコード検出:**
`console.log`や`debugger`をコードから削除

---

## カスタマイズ

ワークフローは必要に応じてカスタマイズできます:

- Node.jsバージョンの変更: `node-version: '18'`
- チェック対象ブランチの追加: `branches: [main, develop, feature/*]`
- ビルドサイズの閾値変更: `if [ $SIZE -gt 5 ]`の数値を変更
