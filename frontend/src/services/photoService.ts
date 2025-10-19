// src/services/photoService.ts

const API_BASE_URL = 'http://localhost:8000'; // 開発環境のAPI URL

export interface PhotoUploadData {
  title?: string;
  description?: string;
  lat?: number;
  lng?: number;
  accuracy_m?: number;
  address?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  taken_at?: string;
}

export interface PhotoResponse {
  id: string;
  user_id: string;
  s3_key: string;
  mime_type: string;
  size_bytes: number;
  title?: string;
  description?: string;
  lat?: number;
  lng?: number;
  accuracy_m?: number;
  address?: string;
  exif?: any;
  visibility: string;
  taken_at?: string;
  created_at: string;
  updated_at: string;
}

class PhotoService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // 実際の実装では、ストレージからトークンを取得
    const token = await this.getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async getStoredToken(): Promise<string | null> {
    // AsyncStorageからトークンを取得する実装
    // 今は仮の実装
    return null;
  }

  async uploadPhoto(
    imageUri: string,
    uploadData: PhotoUploadData = {}
  ): Promise<PhotoResponse> {
    try {
      const formData = new FormData();
      
      // 画像ファイルを追加
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // その他のデータを追加
      Object.entries(uploadData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(await this.getAuthHeaders()),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'アップロードに失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  async getPhotos(skip: number = 0, limit: number = 100): Promise<{
    items: PhotoResponse[];
    total: number;
    skip: number;
    limit: number;
    has_next: boolean;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/photos/?skip=${skip}&limit=${limit}`,
        {
          headers: await this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('写真の取得に失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('Get photos error:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('写真の削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete photo error:', error);
      throw error;
    }
  }
}

export default new PhotoService();
