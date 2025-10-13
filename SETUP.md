# React Native iOS Development Environment Setup

## 必要なソフトウェア

### Windows 11 環境
1. **Node.js** (v16以上)
   ```bash
   # Node.jsをインストール
   # https://nodejs.org/ からLTS版をダウンロード
   ```

2. **React Native CLI**
   ```bash
   npm install -g @react-native-community/cli
   ```

3. **Java Development Kit (JDK)**
   ```bash
   # JDK 11をインストール
   # https://adoptium.net/ からダウンロード
   ```

4. **Android Studio** (Android開発用)
   ```bash
   # https://developer.android.com/studio からダウンロード
   ```

### Mac 環境（他の開発メンバー用）
1. **Xcode** (App Storeからインストール)
2. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

3. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

4. **Node.js** (v16以上)
   ```bash
   # Homebrewを使用
   brew install node
   ```

5. **React Native CLI**
   ```bash
   npm install -g @react-native-community/cli
   ```

## プロジェクトセットアップ

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd tk_b_2501
```

### 2. フロントエンド（React Native）セットアップ
```bash
cd frontend
npm install
```

### 3. iOS セットアップ（Mac環境のみ）
```bash
cd ios
pod install
cd ..
```

### 4. バックエンド（FastAPI）セットアップ
```bash
cd backend
pip install -r requirements.txt
```

### 5. Docker環境の起動
```bash
# プロジェクトルートで実行
docker-compose up -d
```

## 開発サーバーの起動

### フロントエンド（React Native）
```bash
cd frontend

# Metro bundlerを起動
npm start

# 別のターミナルでiOSアプリを起動（Mac環境のみ）
npm run ios
```

### バックエンド（FastAPI）
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API エンドポイント

- **API Base URL**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 利用可能なエンドポイント
- `GET /` - APIの状態確認
- `GET /health` - ヘルスチェック
- `POST /users/` - ユーザー作成
- `GET /users/` - ユーザー一覧取得
- `GET /users/{user_id}` - 特定ユーザー取得

## データベース

- **PostgreSQL** がDockerコンテナで起動
- **ポート**: 5432
- **データベース名**: mobileapp
- **ユーザー**: user
- **パスワード**: password

## トラブルシューティング

### React Native iOS
1. **Metro bundlerが起動しない場合**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOSシミュレーターが起動しない場合**
   ```bash
   # Xcodeでシミュレーターを手動起動
   # または
   npx react-native run-ios --simulator="iPhone 14"
   ```

3. **Pod installエラー**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

### FastAPI
1. **データベース接続エラー**
   ```bash
   # Dockerコンテナの状態確認
   docker-compose ps
   
   # ログ確認
   docker-compose logs db
   ```

2. **ポート競合エラー**
   ```bash
   # ポート8000が使用中の場合
   uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

## 開発フロー

1. **機能開発**
   - バックエンドAPIを先に実装
   - フロントエンドでAPIを呼び出し
   - テストを実行

2. **テスト実行**
   ```bash
   # バックエンドテスト
   cd backend
   pytest
   
   # フロントエンドテスト
   cd frontend
   npm test
   ```

3. **デバッグ**
   - React Native: Chrome DevToolsまたはFlipper
   - FastAPI: Swagger UI (`http://localhost:8000/docs`)

## 本番環境へのデプロイ

### iOS App Store
1. XcodeでArchiveを作成
2. App Store Connectにアップロード
3. 審査申請

### バックエンド
1. Dockerイメージをビルド
2. クラウドサービス（AWS、GCP、Azure）にデプロイ
3. データベースを本番環境に移行
