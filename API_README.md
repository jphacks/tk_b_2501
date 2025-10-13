# Photo Sharing API

写真共有アプリケーションのFastAPIバックエンドです。

## 機能

- ユーザー認証・セッション管理
- 写真のアップロード・管理
- 位置情報ベースの写真検索
- 公開範囲の設定（private/unlisted/public）

## データベース設計

### ER図

```
erDiagram
    USERS ||--o{ SESSIONS : "ログインセッション"
    USERS ||--o{ PHOTOS : "写真を所有"

    USERS {
        uuid id PK "ユーザーID（主キー）"
        string email "メールアドレス（ログイン用）"
        string password_hash "パスワードハッシュ（bcrypt）"
        string username "表示名"
        datetime created_at "作成日時"
    }

    SESSIONS {
        uuid id PK "セッションID（主キー）"
        uuid user_id FK "ユーザーID（外部キー）"
        string refresh_token_hash "リフレッシュトークンのハッシュ値"
        string user_agent "アクセス元の端末情報"
        string device_name "端末名（例：iPhone 15）"
        string ip_address "接続元IPアドレス"
        datetime issued_at "発行日時"
        datetime expires_at "有効期限"
        datetime revoked_at "無効化日時（サインアウト時）"
    }

    PHOTOS {
        uuid id PK "写真ID（主キー）"
        uuid user_id FK "投稿者のユーザーID"
        string s3_key "S3上のファイルキー"
        string mime_type "画像のMIMEタイプ（例：image/jpeg）"
        bigint size_bytes "ファイルサイズ（バイト）"
        string title "写真タイトル"
        text description "写真の説明・キャプション"
        float lat "緯度"
        float lng "経度"
        geography location "位置情報（PostGIS Point）"
        float accuracy_m "位置の精度（メートル単位）"
        text address "住所（逆ジオコーディング結果）"
        jsonb exif "EXIF情報（撮影日時など）"
        enum visibility "公開範囲（private/unlisted/public）"
        datetime taken_at "撮影日時"
        datetime created_at "登録日時"
    }
```

## セットアップ

### 1. 環境変数の設定

```bash
cp backend/env.example backend/.env
```

`.env`ファイルを編集して、必要な設定を行ってください。

### 2. Docker Composeで起動

```bash
docker-compose up -d
```

### 3. APIドキュメントの確認

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API エンドポイント

### 認証関連 (`/auth`)

- `POST /auth/register` - ユーザー登録
- `POST /auth/login` - ログイン
- `POST /auth/refresh` - リフレッシュトークンでアクセストークン更新
- `POST /auth/logout` - ログアウト
- `GET /auth/me` - 現在のユーザー情報取得
- `PUT /auth/me` - ユーザー情報更新
- `GET /auth/sessions` - セッション一覧取得
- `DELETE /auth/sessions/{session_id}` - セッション無効化

### 写真関連 (`/photos`)

- `POST /photos/upload` - 写真アップロード
- `GET /photos/` - 写真一覧取得
- `GET /photos/{photo_id}` - 特定の写真取得
- `PUT /photos/{photo_id}` - 写真情報更新
- `DELETE /photos/{photo_id}` - 写真削除
- `GET /photos/nearby/photos` - 近くの写真検索

## 認証方式

JWT（JSON Web Token）を使用した認証システムを実装しています。

1. ログイン時にアクセストークン（30分有効）とリフレッシュトークン（30日有効）を発行
2. APIリクエスト時はアクセストークンをAuthorizationヘッダーに設定
3. アクセストークンが期限切れの場合は、リフレッシュトークンで更新

## 写真の公開範囲

- `private`: 本人のみ閲覧可能
- `unlisted`: リンクを知っている人のみ閲覧可能
- `public`: 誰でも閲覧可能

## 技術スタック

- **FastAPI**: Webフレームワーク
- **SQLAlchemy**: ORM
- **PostgreSQL + PostGIS**: データベース（位置情報対応）
- **JWT**: 認証
- **bcrypt**: パスワードハッシュ化
- **AWS S3**: ファイルストレージ
- **Docker**: コンテナ化

## 開発

### ローカル開発環境

```bash
# バックエンドのみ起動
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### テスト

```bash
cd backend
pytest
```
