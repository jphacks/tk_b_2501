@echo off
REM チーム開発用のセットアップスクリプト（Windows版）
REM このスクリプトを実行すると、開発環境が自動でセットアップされます

echo 🚀 Mobile App 開発環境セットアップを開始します...

REM 1. Docker環境の起動
echo 📦 Docker環境を起動中...
docker-compose up -d

REM 2. データベースの準備完了を待機
echo ⏳ データベースの準備完了を待機中...
timeout /t 10 /nobreak > nul

REM 3. バックエンドの依存関係をインストール
echo 🐍 バックエンドの依存関係をインストール中...
cd backend
pip install -r requirements.txt
cd ..

REM 4. フロントエンドの依存関係をインストール
echo 📱 フロントエンドの依存関係をインストール中...
cd frontend
npm install
cd ..

REM 5. 環境変数ファイルの作成
echo ⚙️ 環境変数ファイルを作成中...
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo ✅ backend\.env ファイルを作成しました
) else (
    echo ℹ️ backend\.env ファイルは既に存在します
)

REM 6. 完了メッセージ
echo.
echo 🎉 セットアップが完了しました！
echo.
echo 📋 次のステップ:
echo 1. バックエンドAPI: http://localhost:8000
echo 2. API ドキュメント: http://localhost:8000/docs
echo 3. データベース管理: http://localhost:8080
echo 4. フロントエンド開発: cd frontend ^&^& npm start
echo.
echo 🛠️ 開発コマンド:
echo - バックエンド起動: cd backend ^&^& uvicorn main:app --reload
echo - フロントエンド起動: cd frontend ^&^& npm start
echo - Docker停止: docker-compose down
echo.
pause
