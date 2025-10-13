# Mobile App Project

React Native（iOS）、FastAPI、PostgreSQL、Dockerを使用したスマホアプリ開発プロジェクトです。

## プロジェクト構成

```
tk_b_2501/
├── frontend/          # React Native iOSアプリ
│   ├── App.tsx
│   ├── package.json
│   └── ...
├── backend/           # FastAPI バックエンド
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── docker-compose.yml # Docker環境設定
└── SETUP.md          # セットアップガイド
```

## 技術スタック

### フロントエンド
- **React Native** 0.72.6
- **TypeScript**
- **React Navigation**
- **Axios** (HTTP クライアント)

### バックエンド
- **FastAPI** 0.104.1
- **SQLAlchemy** (ORM)
- **PostgreSQL** (データベース)
- **Pydantic** (データ検証)

### インフラ
- **Docker** & **Docker Compose**
- **PostgreSQL** (コンテナ)

## クイックスタート

### 1. 環境セットアップ
詳細は [SETUP.md](./SETUP.md) を参照してください。

### 2. 開発サーバー起動
```bash
# Docker環境を起動
docker-compose up -d

# フロントエンド（別ターミナル）
cd frontend
npm install
npm start

# iOSアプリ起動（Mac環境のみ）
npm run ios

# バックエンド（別ターミナル）
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. アクセス
- **iOSアプリ**: iOSシミュレーターで起動
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 開発環境

- **Windows 11**: 開発環境（あなた）
- **Mac**: iOS開発環境（他の開発メンバー）

## 主要機能

- ユーザー管理API
- RESTful API設計
- データベース連携
- クロスプラットフォーム対応

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。