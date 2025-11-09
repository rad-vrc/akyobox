# Design Document - 激烈！デビルヤギAkyo叩き

## Overview

「激烈！デビルヤギAkyo叩き」は、React + TypeScript + Viteで構築されたシングルページアプリケーション（SPA）です。プレイヤーは30秒間の制限時間内に、画面にランダムに表示されるデビルヤギAkyo（正解画像）をクリックして得点を獲得します。間違った画像をクリックすると減点されます。ゲームはVercelにデプロイされ、ブラウザ上で動作します。

## Architecture

### Component Structure

```
App
├── GameTitle (タイトルロゴ表示)
├── StartScreen (ゲーム開始画面)
│   └── StartButton
├── GameScreen (ゲームプレイ画面)
│   ├── ScoreDisplay (得点表示)
│   ├── TimerDisplay (残り時間表示)
│   └── GameBoard (Akyoが表示されるエリア)
│       └── AkyoItem[] (個々のAkyo画像)
├── GameOverScreen (ゲーム終了画面)
│   ├── FinalScore (最終得点表示)
│   └── RestartButton
└── SettingsScreen (設定画面)
    └── ImageUploader (はずれ画像のアップロード)
```

### State Management

Reactの`useState`と`useEffect`フックを使用してゲーム状態を管理します。

**主要な状態:**
- `gameState`: 'start' | 'playing' | 'gameover' | 'settings'
- `score`: number (現在の得点)
- `timeRemaining`: number (残り時間、秒単位)
- `akyos`: Array<AkyoData> (画面に表示されているAkyoの配列)
- `decoyImages`: string[] (カスタマイズ可能なはずれ画像のURL配列)

### Data Flow

1. ユーザーがスタートボタンをクリック → `gameState`を'playing'に変更
2. タイマーが開始 → 1秒ごとに`timeRemaining`をデクリメント
3. ランダムな間隔でAkyoを生成 → `akyos`配列に追加
4. ユーザーがAkyoをクリック → 得点計算、`akyos`配列から削除
5. タイマーが0になる → `gameState`を'gameover'に変更

## Components and Interfaces

### 1. GameTitle Component

**責任:** ゲームタイトルロゴを表示

**Props:** なし

**実装:**
```typescript
const GameTitle: React.FC = () => {
  return (
    <div className="game-title">
      <img src="/GameTitle.png" alt="激烈！デビルヤギAkyo叩き" />
    </div>
  );
};
```

### 2. StartScreen Component

**責任:** ゲーム開始画面を表示し、スタートボタンと設定ボタンを提供

**Props:**
```typescript
interface StartScreenProps {
  onStart: () => void;
  onSettings: () => void;
}
```

### 3. GameScreen Component

**責任:** ゲームプレイ中の画面を管理

**Props:**
```typescript
interface GameScreenProps {
  score: number;
  timeRemaining: number;
  akyos: AkyoData[];
  onAkyoClick: (id: string, isTarget: boolean) => void;
}
```

### 4. AkyoItem Component

**責任:** 個々のAkyo画像を表示し、クリックイベントを処理

**Props:**
```typescript
interface AkyoItemProps {
  id: string;
  imageUrl: string;
  isTarget: boolean;
  position: { x: number; y: number };
  onAkyoClick: (id: string, isTarget: boolean) => void;
}
```

**実装詳細:**
- ランダムな位置に絶対配置（`position: absolute`）
- クリック時にアニメーション効果を追加
- 1.5秒後に自動的に消える

### 5. SettingsScreen Component

**責任:** はずれ画像のカスタマイズ機能を提供

**Props:**
```typescript
interface SettingsScreenProps {
  decoyImages: string[];
  onImageUpload: (index: number, file: File) => void;
  onBack: () => void;
}
```

**実装詳細:**
- 2つのはずれ画像スロットを表示
- ファイル入力でローカル画像をアップロード
- `FileReader` APIを使用して画像をBase64に変換
- `localStorage`に保存して永続化

## Data Models

### AkyoData Interface

```typescript
interface AkyoData {
  id: string; // ユニークID（UUID）
  imageUrl: string; // 画像のURL
  isTarget: boolean; // 正解画像かどうか
  position: { x: number; y: number }; // 画面上の位置（%単位）
  createdAt: number; // 生成時刻（タイムスタンプ）
}
```

### GameConfig

```typescript
interface GameConfig {
  gameDuration: number; // ゲーム時間（秒）
  targetImage: string; // 正解画像のパス
  defaultDecoyImages: string[]; // デフォルトのはずれ画像
  spawnInterval: { min: number; max: number }; // Akyo生成間隔（ミリ秒）
  akyoLifetime: number; // Akyoの表示時間（ミリ秒）
  maxAkyosOnScreen: number; // 同時表示最大数
  targetScore: number; // 正解時の得点
  decoyPenalty: number; // 不正解時の減点
}
```

**デフォルト値:**
```typescript
const DEFAULT_CONFIG: GameConfig = {
  gameDuration: 30,
  targetImage: '/akyo_devilyagi.png',
  defaultDecoyImages: ['/akyo_humanoid.png', '/akyo_yagi.png'],
  spawnInterval: { min: 1000, max: 2000 },
  akyoLifetime: 1500,
  maxAkyosOnScreen: 3,
  targetScore: 10,
  decoyPenalty: 5,
};
```

## Game Logic

### Akyo生成ロジック

```typescript
const spawnAkyo = () => {
  // 現在の画面上のAkyo数をチェック
  if (akyos.length >= maxAkyosOnScreen) return;

  // ランダムに正解/不正解を決定（50%の確率）
  const isTarget = Math.random() > 0.5;
  
  // 画像URLを選択
  const imageUrl = isTarget 
    ? targetImage 
    : decoyImages[Math.floor(Math.random() * decoyImages.length)];

  // ランダムな位置を生成（重複チェック付き）
  const position = generateRandomPosition(akyos);

  // 新しいAkyoを作成
  const newAkyo: AkyoData = {
    id: crypto.randomUUID(),
    imageUrl,
    isTarget,
    position,
    createdAt: Date.now(),
  };

  setAkyos(prev => [...prev, newAkyo]);

  // 一定時間後に自動削除
  setTimeout(() => {
    setAkyos(prev => prev.filter(a => a.id !== newAkyo.id));
  }, akyoLifetime);
};
```

### 位置生成ロジック

```typescript
const generateRandomPosition = (existingAkyos: AkyoData[]) => {
  const minDistance = 150; // 最小距離（ピクセル）
  let attempts = 0;
  let position: { x: number; y: number };

  do {
    position = {
      x: Math.random() * 80 + 10, // 10-90%の範囲
      y: Math.random() * 70 + 10, // 10-80%の範囲
    };
    attempts++;
  } while (
    attempts < 10 &&
    existingAkyos.some(akyo => 
      calculateDistance(position, akyo.position) < minDistance
    )
  );

  return position;
};
```

### 得点計算ロジック

```typescript
const handleAkyoClick = (id: string, isTarget: boolean) => {
  // Akyoを削除
  setAkyos(prev => prev.filter(a => a.id !== id));

  // 得点を更新
  if (isTarget) {
    setScore(prev => prev + targetScore);
  } else {
    setScore(prev => Math.max(0, prev - decoyPenalty));
  }
};
```

### タイマーロジック

```typescript
useEffect(() => {
  if (gameState !== 'playing') return;

  const timerId = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        setGameState('gameover');
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timerId);
}, [gameState]);
```

### Akyo生成スケジューラー

```typescript
useEffect(() => {
  if (gameState !== 'playing') return;

  const scheduleNextSpawn = () => {
    const delay = Math.random() * 
      (spawnInterval.max - spawnInterval.min) + 
      spawnInterval.min;
    
    return setTimeout(() => {
      spawnAkyo();
      scheduleNextSpawn();
    }, delay);
  };

  const timeoutId = scheduleNextSpawn();

  return () => clearTimeout(timeoutId);
}, [gameState, akyos]);
```

## Image Management

### カスタム画像の保存

```typescript
const saveCustomImage = (index: number, file: File) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const imageData = e.target?.result as string;
    
    // localStorageに保存
    const customImages = JSON.parse(
      localStorage.getItem('customDecoyImages') || '[]'
    );
    customImages[index] = imageData;
    localStorage.setItem('customDecoyImages', JSON.stringify(customImages));
    
    // 状態を更新
    setDecoyImages(prev => {
      const newImages = [...prev];
      newImages[index] = imageData;
      return newImages;
    });
  };
  
  reader.readAsDataURL(file);
};
```

### カスタム画像の読み込み

```typescript
const loadCustomImages = () => {
  const customImages = JSON.parse(
    localStorage.getItem('customDecoyImages') || '[]'
  );
  
  const images = [...defaultDecoyImages];
  customImages.forEach((img: string, index: number) => {
    if (img) images[index] = img;
  });
  
  setDecoyImages(images);
};
```

## Styling

### レイアウト

- フルスクリーンレイアウト（`width: 100vw`, `height: 100vh`）
- GameBoardは相対配置（`position: relative`）
- AkyoItemは絶対配置（`position: absolute`）

### レスポンシブデザイン

```css
/* モバイル対応 */
@media (max-width: 768px) {
  .akyo-item {
    width: 80px;
    height: 80px;
  }
}

/* デスクトップ */
@media (min-width: 769px) {
  .akyo-item {
    width: 120px;
    height: 120px;
  }
}
```

### アニメーション

```css
/* Akyo出現アニメーション */
@keyframes pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* クリック時のアニメーション */
@keyframes hit {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  100% {
    transform: scale(0) rotate(20deg);
    opacity: 0;
  }
}
```

## Error Handling

### 画像読み込みエラー

```typescript
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  // フォールバック画像を表示
  e.currentTarget.src = '/fallback.png';
};
```

### ファイルアップロードエラー

```typescript
const validateImageFile = (file: File): boolean => {
  // ファイルタイプチェック
  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを選択してください');
    return false;
  }
  
  // ファイルサイズチェック（5MB以下）
  if (file.size > 5 * 1024 * 1024) {
    alert('ファイルサイズは5MB以下にしてください');
    return false;
  }
  
  return true;
};
```

### localStorage エラー

```typescript
const safeLocalStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    alert('設定の保存に失敗しました');
  }
};
```

## Testing Strategy

### Unit Tests

- **ゲームロジック関数のテスト**
  - `generateRandomPosition`: 位置が範囲内か、重複していないか
  - `calculateDistance`: 距離計算が正確か
  - 得点計算: 正解/不正解時の得点変化が正しいか

### Integration Tests

- **コンポーネント統合テスト**
  - スタートボタンクリック → ゲーム開始
  - Akyoクリック → 得点更新
  - タイマー終了 → ゲームオーバー画面表示

### Manual Testing

- **ブラウザテスト**
  - Chrome, Firefox, Safari, Edgeでの動作確認
  - モバイルブラウザでの動作確認
- **パフォーマンステスト**
  - 複数のAkyoが同時に表示されても滑らかに動作するか
  - 長時間プレイしてもメモリリークがないか

## Deployment

### Vercel設定

**vercel.json:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ビルド設定

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 環境変数

このプロジェクトでは環境変数は不要です。すべての設定はクライアントサイドで管理されます。

## Performance Considerations

### 最適化戦略

1. **画像の最適化**
   - 画像サイズを適切に圧縮（WebP形式推奨）
   - 画像の遅延読み込み

2. **レンダリング最適化**
   - `React.memo`を使用して不要な再レンダリングを防止
   - `useCallback`でイベントハンドラーをメモ化

3. **状態更新の最適化**
   - 頻繁に更新される状態（タイマー、Akyo配列）を分離
   - バッチ更新を活用

### メモリ管理

- タイマーとインターバルを適切にクリーンアップ
- 不要になったAkyoを配列から削除
- localStorageのサイズを監視（カスタム画像）

## Accessibility

- キーボード操作のサポート（Enterキーでスタート、Escapeで設定画面を閉じる）
- 適切なARIAラベルの使用
- 色覚異常者への配慮（色だけに依存しないデザイン）
- スクリーンリーダー対応

## Future Enhancements

- ハイスコアの記録と表示
- 難易度設定（Easy, Normal, Hard）
- サウンドエフェクトとBGM
- マルチプレイヤーモード
- リーダーボード機能
