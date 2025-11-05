# 情報端末

画面サイズに応じてレスポンシブに表示される、アナログ時計と天気情報を組み合わせたWebダッシュボードです。

Astroフレームワークを使用したコンポーネントベースの静的サイトとして構築されています。

## ライブデモ

https://tenk.yamaguchi.jp/clock.github.io/ でアクセス可能です。

## 表示内容
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/05f007ae-4967-43a2-8999-3002bde72f9d" />

### 🕐 アナログ時計
- **現在時刻**: デジタル表示（24時間形式）
- **秒針**: リアルタイムで回転するアナログ秒針
- **目盛り**: 12個の時刻目盛り（3時、6時、9時、12時は強調表示）
- **レスポンシブサイズ**: 画面サイズに応じて200px〜500pxで動的調整

### 📅 日付表示
- **年月日**: YYYY/MM/DD 形式
- **曜日**: 土曜日（青色）、日曜日（赤色）で色分け表示
- **祝日対応**: 主要な固定祝日を判定

### 🌤️ 天気情報
- **現在の天気**: 気温、天気アイコン、天気説明
- **最高・最低気温**: 当日の予想気温
- **24時間予報グラフ**: 気温と降水確率の推移（日の出・日の入り時間をハイライト）
- **週間天気予報**: 7日間の天気アイコンと最高・最低気温

## 技術スタック

- **フレームワーク**: [Astro](https://astro.build/) v4.16.18（静的サイトジェネレーター）
- **言語**: TypeScript（strict mode）
- **スタイリング**: Tailwind CSS（CDN経由）
- **グラフ描画**: Chart.js v4.4.7
- **デプロイ**: GitHub Actions + GitHub Pages
- **フォント**: Inter（Google Fonts）

## セットアップと開発

### 必要環境
- Node.js（推奨: v18以上）
- npm

### インストール

```bash
# 依存関係のインストール
npm install
```

### 開発サーバー

```bash
# 開発サーバーを起動（ホットリロード対応）
npm run dev
```

開発サーバーは `http://localhost:4321` で起動します。

### ビルド

```bash
# 本番用ビルド（TypeScriptチェック + Astroビルド）
npm run build

# ビルド結果のプレビュー
npm run preview
```

ビルド結果は `dist/` ディレクトリに出力されます。

## プロジェクト構造

```
/
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # ベースレイアウト（<head>、CDN読み込みなど）
│   ├── components/
│   │   ├── AnalogClock.astro     # アナログ時計コンポーネント
│   │   ├── WeatherCard.astro     # 現在の天気表示
│   │   ├── ForecastChart.astro   # 24時間予報グラフ
│   │   └── WeeklyForecast.astro  # 週間天気予報
│   └── pages/
│       └── index.astro           # メインページ（全コンポーネントを統合）
├── public/
│   └── weather.js                # 天気API連携ロジック
├── .github/workflows/
│   └── deploy.yml                # 自動デプロイ設定
├── astro.config.mjs              # Astro設定ファイル
├── package.json                  # 依存関係とスクリプト
└── tsconfig.json                 # TypeScript設定
```

## コンポーネント構成

### Layout.astro
基本的なHTML構造を提供するベースレイアウト。CDN経由でTailwind CSSとChart.jsを読み込み、ダークテーマのグローバルスタイルを定義します。

### AnalogClock.astro
アナログ時計の表示と動作を担当。以下の機能を含みます：
- 時刻の目盛り生成と描画
- 秒針のリアルタイム回転アニメーション
- 画面サイズに応じた時計サイズの動的調整
- 日付表示（曜日・祝日の色分け表示）

### WeatherCard.astro
現在の天気情報を表示するカード型コンポーネント。気温、天気アイコン、天気説明、最高・最低気温を表示します。

### ForecastChart.astro
24時間予報をChart.jsで可視化するコンポーネント。気温と降水確率の折れ線グラフを描画し、日の出・日の入り時間を背景でハイライトします。

### WeeklyForecast.astro
7日間の週間天気予報を表示するコンポーネント。各日の天気アイコンと最高・最低気温を並べて表示します。

### weather.js
天気APIとの連携を担当する外部スクリプト：
- Geolocation APIによる位置情報取得（フォールバック: 東大和市）
- Open-Meteo APIからの天気データ取得
- 各コンポーネントへのデータ反映
- 5分間隔での自動更新

## 使用API

### Open-Meteo API
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **対象地域**: 東大和市（緯度: 35.7505, 経度: 139.4296）
- **取得データ**:
  - 現在気温 (`current.temperature_2m`)
  - 日別天気コード (`daily.weather_code`)
  - 日別最高・最低気温 (`daily.temperature_2m_max`, `daily.temperature_2m_min`)
  - 日の出・日の入り時刻 (`daily.sunrise`, `daily.sunset`)
  - 時間別気温 (`hourly.temperature_2m`)
  - 時間別降水確率 (`hourly.precipitation_probability`)
- **更新頻度**: 5分間隔
- **タイムゾーン**: Asia/Tokyo

### 天気コード変換
WMO Weather interpretation codesに基づいて天気アイコンと説明を表示：
- 0-3: 晴れ・快晴 ☀️
- 45-48: 霧 🌫️
- 51-67: 雨 🌧️
- 71-77: 雪 🌨️
- 80-82: にわか雨 🌧️
- 85-86: にわか雪 🌨️
- 95-99: 雷雨 🌩️

## スタイリングとデザイン

- **テーマ**: ダークグラデーション背景
- **エフェクト**: ガラスモーフィズム、バックドロップフィルター
- **レスポンシブ対応**: 画面サイズに応じて時計サイズを動的調整（200px〜500px）
- **レイアウト**: 2カラム構成（左: アナログ時計、右: 天気情報）

## 更新タイミング

- **時刻表示**: 1秒間隔
- **天気データ**: 5分間隔（自動更新）
- **最終更新時刻**: 右下に表示

## デプロイ

このプロジェクトはGitHub Actionsを使用して自動的にデプロイされます。

### 自動デプロイフロー

1. `main` ブランチへのpush時に自動実行
2. Node.js環境のセットアップ
3. 依存関係のインストール
4. Astroビルドの実行（`npm run build`）
5. GitHub Pagesへのデプロイ

### カスタムドメイン設定

- ベースURL: `/clock.github.io` （`astro.config.mjs` で設定）
- カスタムドメイン: https://tenk.yamaguchi.jp/clock.github.io/


