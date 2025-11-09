# Requirements Document

## Introduction

このドキュメントは、Vercelにデプロイする簡単なデビルヤギAkyo叩きゲームの要件を定義します。プレイヤーは画面に表示される特定の画像（akyo_devilyagi.png）をクリックして得点を獲得し、それ以外の画像をクリックすると減点されます。

## Glossary

- **Game System**: デビルヤギAkyo叩きゲームのアプリケーション全体
- **Target Akyo**: 叩くべき正解の画像（akyo_devilyagi.png）
- **Decoy Akyo**: 叩いてはいけない不正解の画像（akyo_humanoid.png、akyo_yagi.png）
- **Game Session**: ゲームの開始から終了までの1回のプレイ
- **Score**: プレイヤーの現在の得点
- **Timer**: ゲームの残り時間を表示するカウントダウン

## Requirements

### Requirement 1

**User Story:** プレイヤーとして、ゲームを開始して制限時間内にデビルヤギAkyoを叩きたい

#### Acceptance Criteria

1. WHEN THE Game System loads, THE Game System SHALL display a start button
2. WHEN the player clicks the start button, THE Game System SHALL initialize a Game Session with a duration of 30 seconds
3. WHILE a Game Session is active, THE Game System SHALL display the remaining time in the Timer
4. WHEN the Timer reaches zero, THE Game System SHALL end the Game Session and display the final Score

### Requirement 2

**User Story:** プレイヤーとして、正しいデビルヤギAkyoを叩いて得点を獲得したい

#### Acceptance Criteria

1. WHILE a Game Session is active, THE Game System SHALL randomly display between 1 and 3 Akyos on the screen at intervals of 1 to 2 seconds
2. WHILE a Game Session is active, THE Game System SHALL display Target Akyo images and Decoy Akyo images in random positions
3. WHEN the player clicks on a Target Akyo, THE Game System SHALL increase the Score by 10 points
4. WHEN the player clicks on a Target Akyo, THE Game System SHALL remove the clicked Akyo from the display
5. WHEN a displayed Akyo is not clicked within 1.5 seconds, THE Game System SHALL remove the Akyo from the display

### Requirement 3

**User Story:** プレイヤーとして、間違ったAkyoを叩いたときにペナルティを受けたい

#### Acceptance Criteria

1. WHEN the player clicks on a Decoy Akyo, THE Game System SHALL decrease the Score by 5 points
2. WHEN the player clicks on a Decoy Akyo, THE Game System SHALL remove the clicked Akyo from the display
3. THE Game System SHALL prevent the Score from becoming negative by setting a minimum value of 0

### Requirement 4

**User Story:** プレイヤーとして、現在の得点を常に確認したい

#### Acceptance Criteria

1. THE Game System SHALL display the current Score at all times during a Game Session
2. WHEN the Score changes, THE Game System SHALL update the displayed Score immediately
3. WHEN a Game Session ends, THE Game System SHALL display the final Score prominently

### Requirement 5

**User Story:** プレイヤーとして、ゲーム終了後に再度プレイしたい

#### Acceptance Criteria

1. WHEN a Game Session ends, THE Game System SHALL display a restart button
2. WHEN the player clicks the restart button, THE Game System SHALL reset the Score to 0 and start a new Game Session
3. WHEN a new Game Session starts, THE Game System SHALL reset the Timer to 30 seconds

### Requirement 6

**User Story:** プレイヤーとして、はずれ画像を自分の好きな画像に変更したい

#### Acceptance Criteria

1. THE Game System SHALL provide a settings interface accessible before or after a Game Session
2. WHEN the player accesses the settings interface, THE Game System SHALL display the current Decoy Akyo images
3. WHEN the player uploads a new image file, THE Game System SHALL validate that the file is an image format
4. WHEN the player uploads a valid image file, THE Game System SHALL replace one of the Decoy Akyo images with the uploaded image
5. WHEN a Game Session starts, THE Game System SHALL use the currently configured Decoy Akyo images

### Requirement 7

**User Story:** プレイヤーとして、ゲームのタイトルを見てゲームの内容を理解したい

#### Acceptance Criteria

1. THE Game System SHALL display the game title "激烈！デビルヤギAkyo叩き" using the GameTitle.png logo image
2. WHEN the Game System loads, THE Game System SHALL display the game title prominently on the start screen
3. THE Game System SHALL maintain consistent branding throughout the game interface
