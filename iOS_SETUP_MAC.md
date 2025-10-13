# iOS開発セットアップ手順（Mac環境）

## 1. 必要なソフトウェアのインストール

### Xcodeのインストール
```bash
# App StoreからXcodeをインストール
# または
xcode-select --install
```

### CocoaPodsのインストール
```bash
sudo gem install cocoapods
```

### Node.jsのインストール
```bash
# Homebrewを使用
brew install node

# または公式サイトから
# https://nodejs.org/
```

### React Native CLIのインストール
```bash
npm install -g @react-native-community/cli
```

## 2. iOSプロジェクトの初期化

```bash
cd tk_b_2501/frontend

# iOSプロジェクトを初期化
npx react-native init MobileApp --template react-native-template-typescript

# または既存のプロジェクトをiOS対応にする
npx react-native init MobileApp
```

## 3. iOS依存関係のインストール

```bash
cd ios
pod install
cd ..
```

## 4. iOSシミュレーターでの実行

```bash
# Metro bundlerを起動
npm start

# 別のターミナルでiOSアプリを起動
npm run ios

# または特定のシミュレーターを指定
npx react-native run-ios --simulator="iPhone 14"
```

## 5. トラブルシューティング

### Pod installエラー
```bash
cd ios
pod deintegrate
pod install
```

### シミュレーターが起動しない
```bash
# Xcodeでシミュレーターを手動起動
# または
xcrun simctl list devices
npx react-native run-ios --simulator="iPhone 14"
```

### Metro bundlerエラー
```bash
npx react-native start --reset-cache
```

## 6. 開発フロー

1. **コード編集**: `App.tsx`やその他のコンポーネントを編集
2. **ホットリロード**: 変更が自動的にシミュレーターに反映
3. **デバッグ**: Chrome DevToolsまたはFlipperを使用
4. **テスト**: Jestでユニットテストを実行

## 7. 実機でのテスト

1. **Apple Developer Account**が必要
2. **Provisioning Profile**の設定
3. **実機でのビルド・実行**

```bash
npx react-native run-ios --device
```
