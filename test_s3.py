#!/usr/bin/env python3
import boto3
import os
import uuid

# S3クライアントを初期化
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'ap-northeast-1')
)

bucket_name = os.getenv('S3_BUCKET_NAME')

print(f"S3バケット名: {bucket_name}")
print(f"AWSリージョン: {os.getenv('AWS_REGION', 'ap-northeast-1')}")

try:
    # バケット内のファイル一覧を取得
    response = s3_client.list_objects_v2(Bucket=bucket_name)
    
    if 'Contents' in response:
        print(f"\nS3バケット内のファイル数: {len(response['Contents'])}")
        for obj in response['Contents']:
            print(f"- {obj['Key']} ({obj['Size']} bytes, {obj['LastModified']})")
    else:
        print("\nS3バケットは空です")
    
    # テストファイルをアップロード
    test_content = b"Test image content for S3 upload verification"
    test_filename = f"test-{uuid.uuid4()}.txt"
    
    print(f"\nテストファイルをアップロード中: {test_filename}")
    s3_client.put_object(
        Bucket=bucket_name,
        Key=f"photos/{test_filename}",
        Body=test_content,
        ContentType='text/plain'
    )
    
    print("✅ S3アップロード成功！")
    
    # アップロードしたファイルのURLを生成
    url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION', 'ap-northeast-1')}.amazonaws.com/photos/{test_filename}"
    print(f"アップロードされたファイルのURL: {url}")
    
except Exception as e:
    print(f"❌ エラー: {e}")
