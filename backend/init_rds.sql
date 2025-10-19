-- RDS PostgreSQL初期化スクリプト
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- セッションテーブル
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- 写真テーブル
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    s3_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    lat FLOAT,
    lng FLOAT,
    location GEOGRAPHY(POINT, 4326),
    accuracy_m FLOAT,
    address TEXT,
    exif JSONB,
    visibility VARCHAR(20) DEFAULT 'private' NOT NULL CHECK (visibility IN ('private', 'unlisted', 'public')),
    taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_revoked_at ON sessions(revoked_at);

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_visibility ON photos(visibility);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_photos_location ON photos USING GIST(location);

-- サンプルデータの挿入（開発環境用）
-- パスワードハッシュは 'password' のbcryptハッシュ
INSERT INTO users (id, email, password_hash, username) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'test1@example.com', '$2b$12$pvU4FTRcN72EPi/ij1E2sOO2uc.cFl5hUSYT6Bt38BWP8t9V5gXFe', 'テストユーザー1'),
    ('550e8400-e29b-41d4-a716-446655440002', 'test2@example.com', '$2b$12$pvU4FTRcN72EPi/ij1E2sOO2uc.cFl5hUSYT6Bt38BWP8t9V5gXFe', 'テストユーザー2')
ON CONFLICT (email) DO NOTHING;