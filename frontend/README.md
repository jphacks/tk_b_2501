# JP HACKS 2025 フロントエンド開発ガイド

このプロジェクトは React Native (React Native CLI) を用いて構築されており、主に iOS プラットフォームを対象としています。

## 🎯 このドキュメントの目的

このドキュメントは、新しく参加したメンバーが**最短時間で、スムーズに手元の Mac で開発を開始できる**ようにするためのガイドです。

もし環境構築中にこの`README`に書かれていない問題に遭遇した場合は、ためらわずに既存のメンバーに質問してください。

---

## 🚀 初回環境構築ガイド (Mac & Apple Silicon)

> **警告:** このセクションの操作は非常に重要であり、最初のセットアップ時のみ必要です。必ず順番通りに実行してください。

### 1. システム全体の開発ツールのインストール

#### 1.1. Homebrew

まだ Homebrew（Mac 用パッケージマネージャー）をインストールしていない場合は、ターミナルを開いて以下のコマンドを実行します。

```sh
/bin/bash -c "$(curl -fsSL [https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh))"
```

#### 1.2. Node.js

Homebrew を使って Node.js をインストールします。

```sh
brew install node
```

#### 1.3. Xcode

Mac App Store から Xcode をダウンロードしてインストールしてください。 インストール完了後、**必ず一度 Xcode を起動し**、追加コンポーネントのインストールとライセンス契約への同意を完了させてください。

#### 1.4. Xcode Command Line Tools

ターミナルを開いて実行します。

```sh
xcode-select --install
```

#### 1.5. Ruby 環境 (重要！)

macOS に標準でインストールされている Ruby はバージョンが古く、`pod install`が失敗する原因となります。 `rbenv`を使って新しいバージョンの Ruby をインストールし、切り替える必要があります。

```sh
# rbenvとruby-buildをインストール
brew install rbenv ruby-build

# 新しいバージョンのRubyをインストール (例: 3.3.0)
rbenv install 3.3.0

# 新しいバージョンをグローバルデフォルトとして設定
rbenv global 3.3.0

# ターミナルが新しいRubyを認識できるように設定 (Zshユーザー向け)
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
```

**重要:** 上記の設定を有効にするため、ターミナルを完全に閉じてから再起動してください。
再起動後、`ruby -v` を実行し、バージョンが `3.3.0` など、新しくインストールしたものになっていることを確認してください。

#### 1.6. CocoaPods

新しい Ruby 環境で CocoaPods をインストールします。 この時、`sudo` は**不要**です。

```sh
gem install cocoapods
```

#### 1.7. Xcode パスの設定

コマンドラインツールが、簡易版ではなく完全版の Xcode アプリを参照するようにパスを修正します。

```sh
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

(このステップでは Mac のログインパスワードの入力が必要です)

### 2. プロジェクト依存関係のインストール

これで PC の準備は完了です。次に、プロジェクト自体が必要とするライブラリをインストールします。

```sh
# まず、frontendフォルダ内にいることを確認してください
cd path/to/your/project/frontend

# JavaScriptの依存関係をインストール
npm install

# iOSネイティブの依存関係をインストール
cd ios
pod install
cd ..
```

---

## 💻 日々の開発フロー

[cite_start]日々の開発作業はもっとシンプルです。 [cite: 1]

### 1. バックエンドサーバーの起動 (必要な場合)

[cite_start]プロジェクトのルートディレクトリ（`tk_b_2501`）で、Docker を使ってバックエンド API とデータベースを起動します。 [cite: 1]

```sh
docker-compose up
```

### 2. フロントエンド開発サーバーの起動 (ターミナルが 2 つ必要)

#### ターミナル ①: Metro サーバーを起動

[cite_start]このターミナルは、JavaScript コードをコンパイルし、提供する役割を担います。 [cite: 1]

```sh
# frontendフォルダに移動
cd frontend

# Metroを起動
npm start
```

[cite_start]このターミナルウィンドウは、開発中ずっと起動したままにしておく必要があります。 [cite: 1]

#### ターミナル ②: iOS アプリを起動

このターミナルは、ネイティブアプリをビルドし、シミュレータにインストールする役割を担います。

```sh
# (別の新しいターミナルを開いて) frontendフォルダに移動
cd frontend

# iOSシミュレータを起動し、アプリを実行
npm run ios
```

しばらくすると、iOS シミュレータが自動的に起動し、アプリが表示されます。

### 3. コードの変更とデバッグ

- お好みのエディタ（VS Code など）で `frontend` フォルダ内のファイルを変更します。
- ファイルを保存すると、アプリは自動的にリフレッシュされます（**Fast Refresh**機能）。

---

## ⁉️ トラブルシューティング

### 1. "Simulator not found" (シミュレータが見つからない) エラー

- **原因:** Xcode のシミュレータが正しくインストールされていないか、認識されていません。
- **解決策:**
  1.  Xcode を開きます。
  2.  `Xcode` -> `Settings...` -> `Components` タブに移動します。
  3.  少なくとも一つの iOS シミュレータ（例: `iOS 17 Simulator`）がダウンロード・インストールされていることを確認します。

### 2. 画面が更新されず、古い内容が表示され続ける

- **原因:** Metro サーバーのキャッシュが古くなっています。
- **解決策:**
  1.  実行中のすべてのターミナルを停止します (`Ctrl + C`)。
  2.  ターミナル ① で、以下のコマンドを使ってキャッシュをクリアし、Metro サーバーを再起動します。
      ```sh
      npm start -- --reset-cache
      ```
  3.  Metro が起動した後、ターミナル ② で `npm run ios` を実行します。
