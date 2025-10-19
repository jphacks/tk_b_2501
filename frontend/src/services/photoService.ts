// src/services/photoService.ts

import authService from './authService';

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
}

export interface PaginatedPhotoResponse {
  items: PhotoResponse[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

class PhotoService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    // 実際の実装では、ストレージからトークンを取得
    const token = await this.getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async getStoredToken(): Promise<string | null> {
    // authServiceからトークンを取得
    const token = authService.getToken();
    
    if (token) {
      console.log('Using token from authService');
      return token;
    }
    
    // 開発環境用のフォールバック（テスト用）
    if (__DEV__) {
      console.warn('No token in authService. Please login first.');
    }
    
    return null;
  }

  async uploadPhoto(
    imageUri: string,
    uploadData: PhotoUploadData = {}
  ): Promise<PhotoResponse> {
    try {
      // クエリパラメータを構築
      const queryParams = new URLSearchParams();
      if (uploadData.title) queryParams.append('title', uploadData.title);
      if (uploadData.description) queryParams.append('description', uploadData.description);
      if (uploadData.lat !== undefined) queryParams.append('lat', String(uploadData.lat));
      if (uploadData.lng !== undefined) queryParams.append('lng', String(uploadData.lng));
      if (uploadData.accuracy_m !== undefined) queryParams.append('accuracy_m', String(uploadData.accuracy_m));
      if (uploadData.address) queryParams.append('address', uploadData.address);
      if (uploadData.visibility) {
        // visibilityを小文字に変換
        queryParams.append('visibility', uploadData.visibility.toLowerCase());
      }
      if (uploadData.taken_at) queryParams.append('taken_at', uploadData.taken_at);

      const formData = new FormData();
      
      // 画像ファイルを追加
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // 認証トークンを取得
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // multipart/form-dataの場合、Content-Typeは自動設定されるため指定しない

      const url = `${API_BASE_URL}/photos/upload?${queryParams.toString()}`;
      console.log('Uploading to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'アップロードに失敗しました' };
        }
        throw new Error(errorData.detail || 'アップロードに失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  async getPhotos(skip: number = 0, limit: number = 100): Promise<PaginatedPhotoResponse> {
    try {
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}/photos/?skip=${skip}&limit=${limit}`;
      console.log('Fetching photos from:', url);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get photos error response:', errorText);
        throw new Error('写真の取得に失敗しました');
      }

      const data = await response.json();
      console.log(`Fetched ${data.items?.length || 0} photos`);
      return data;
    } catch (error) {
      console.error('Get photos error:', error);
      throw error;
    }
  }

  /**
   * 現在のユーザーの写真を取得（明示的にuser_idを指定）
   */
  async getMyPhotos(skip: number = 0, limit: number = 100): Promise<PaginatedPhotoResponse> {
    try {
      // 現在のユーザー情報を取得
      const currentUser = await authService.getCurrentUser();
      
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // user_idパラメータを明示的に指定
      const url = `${API_BASE_URL}/photos/?skip=${skip}&limit=${limit}&user_id=${currentUser.id}`;
      console.log('Fetching my photos from:', url);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get my photos error response:', errorText);
        throw new Error('写真の取得に失敗しました');
      }

      const data = await response.json();
      console.log(`Fetched ${data.items?.length || 0} photos for user ${currentUser.username}`);
      return data;
    } catch (error) {
      console.error('Get my photos error:', error);
      throw error;
    }
  }

  /**
   * 特定ユーザーの写真を取得
   */
  async getUserPhotos(userId: string, skip: number = 0, limit: number = 100): Promise<PaginatedPhotoResponse> {
    try {
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}/photos/?skip=${skip}&limit=${limit}&user_id=${userId}`;
      console.log('Fetching user photos from:', url);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get user photos error response:', errorText);
        throw new Error('写真の取得に失敗しました');
      }

      const data = await response.json();
      console.log(`Fetched ${data.items?.length || 0} photos for user ${userId}`);
      return data;
    } catch (error) {
      console.error('Get user photos error:', error);
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
