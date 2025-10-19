#!/usr/bin/env python3
"""
AWS RDSレコード確認スクリプト
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def check_rds_records():
    """RDSデータベースのレコードを確認"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL環境変数を設定してください")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("=== AWS RDSデータベースレコード確認 ===\n")
        
        # 接続情報の確認
        cursor.execute("SELECT current_database(), current_user, version();")
        info = cursor.fetchone()
        print(f"📊 データベース情報:")
        print(f"  - データベース: {info['current_database']}")
        print(f"  - ユーザー: {info['current_user']}")
        print(f"  - バージョン: {info['version']}")
        print()
        
        # ユーザー一覧
        print("👥 ユーザー一覧:")
        cursor.execute("SELECT id, email, username, created_at FROM users ORDER BY created_at DESC LIMIT 10;")
        users = cursor.fetchall()
        for user in users:
            print(f"  - {user['username']} ({user['email']}) - {user['created_at']}")
        print(f"  合計: {len(users)} ユーザー\n")
        
        # セッション一覧
        print("🔐 セッション一覧:")
        cursor.execute("SELECT id, user_id, issued_at, expires_at FROM sessions ORDER BY issued_at DESC LIMIT 5;")
        sessions = cursor.fetchall()
        for session in sessions:
            print(f"  - ユーザーID: {session['user_id']} - 発行: {session['issued_at']}")
        print(f"  合計: {len(sessions)} セッション\n")
        
        # 写真一覧
        print("📸 写真一覧:")
        cursor.execute("""
            SELECT p.id, p.title, p.s3_key, p.visibility, p.created_at, u.username 
            FROM photos p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC LIMIT 10;
        """)
        photos = cursor.fetchall()
        for photo in photos:
            print(f"  - {photo['title'] or '無題'} by {photo['username']} ({photo['visibility']}) - {photo['created_at']}")
            print(f"    S3: {photo['s3_key']}")
        print(f"  合計: {len(photos)} 写真\n")
        
        # 統計情報
        print("📊 統計情報:")
        cursor.execute("SELECT COUNT(*) as count FROM users;")
        user_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM sessions;")
        session_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM photos;")
        photo_count = cursor.fetchone()['count']
        
        print(f"  - ユーザー数: {user_count}")
        print(f"  - セッション数: {session_count}")
        print(f"  - 写真数: {photo_count}")
        
        # 最近のアクティビティ
        print("\n🕒 最近のアクティビティ:")
        cursor.execute("""
            SELECT 'user' as type, username as name, created_at as time FROM users
            UNION ALL
            SELECT 'photo' as type, title as name, created_at as time FROM photos
            ORDER BY time DESC LIMIT 5;
        """)
        activities = cursor.fetchall()
        for activity in activities:
            print(f"  - {activity['type']}: {activity['name'] or '無題'} - {activity['time']}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ エラー: {e}")

if __name__ == "__main__":
    check_rds_records()