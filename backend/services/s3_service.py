import boto3
import os
from botocore.exceptions import ClientError
from fastapi import HTTPException
import uuid
from typing import Optional
import mimetypes


class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ap-northeast-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')

        if not self.bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable is required")

    async def upload_image(self, file_content: bytes, file_name: str, content_type: str) -> str:
        """
        画像をS3にアップロードし、URLを返す
        """
        try:
            # ファイル名にUUIDを追加して重複を防ぐ
            file_extension = os.path.splitext(file_name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"

            # S3にアップロード
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=f"photos/{unique_filename}",
                Body=file_content,
                ContentType=content_type
                # ACL='public-read'  # ACLがサポートされていないため削除
            )

            # パブリックURLを生成
            url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION', 'ap-northeast-1')}.amazonaws.com/photos/{unique_filename}"
            return url

        except ClientError as e:
            print(f"S3 ClientError: {e}")
            raise HTTPException(
                status_code=500, detail=f"S3 upload failed: {str(e)}")
        except Exception as e:
            print(f"S3 General Error: {e}")
            raise HTTPException(
                status_code=500, detail=f"S3 upload failed: {str(e)}")

    def get_presigned_url(self, s3_url: str, expiration: int = 3600) -> str:
        """
        S3 URLから署名付きURLを生成
        """
        try:
            # URLからキーを抽出
            if '/photos/' in s3_url:
                key = 'photos/' + s3_url.split('/photos/')[-1]
            else:
                # すでにキーの場合
                key = s3_url

            # 署名付きURLを生成
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=expiration
            )
            return presigned_url

        except ClientError as e:
            print(f"Failed to generate presigned URL: {str(e)}")
            return s3_url  # エラー時は元のURLを返す

    async def delete_image(self, image_url: str) -> bool:
        """
        S3から画像を削除
        """
        try:
            # URLからキーを抽出
            key = image_url.split('/photos/')[-1]

            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=f"photos/{key}"
            )
            return True

        except ClientError as e:
            print(f"S3 delete failed: {str(e)}")
            return False

    def get_content_type(self, file_name: str) -> str:
        """
        ファイル名からContent-Typeを取得
        """
        content_type, _ = mimetypes.guess_type(file_name)
        return content_type or 'application/octet-stream'


# シングルトンインスタンス
s3_service = S3Service()
