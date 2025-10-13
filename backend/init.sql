-- データベース初期化スクリプト
-- このファイルはDockerコンテナ起動時に自動実行されます

-- テーブルが存在しない場合のみ作成
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- サンプルデータの挿入（開発環境用）
INSERT INTO users (name, email) VALUES 
    ('テストユーザー1', 'test1@example.com'),
    ('テストユーザー2', 'test2@example.com')
ON CONFLICT (email) DO NOTHING;
