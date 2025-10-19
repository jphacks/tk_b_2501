// src/services/authService.ts

const API_BASE_URL = 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

class AuthService {
  private token: string | null = null;

  /**
   * トークンを設定
   */
  setToken(token: string) {
    this.token = token;
    // TODO: AsyncStorageに保存
    // AsyncStorage.setItem('auth_token', token);
  }

  /**
   * トークンを取得
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * トークンをクリア
   */
  clearToken() {
    this.token = null;
    // TODO: AsyncStorageから削除
    // AsyncStorage.removeItem('auth_token');
  }

  /**
   * ログイン
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: 'ログインに失敗しました' };
        }
        throw new Error(errorData.detail || 'ログインに失敗しました');
      }

      const authData: AuthResponse = await response.json();
      
      // トークンを保存
      this.setToken(authData.access_token);
      
      console.log('Login successful, token saved');
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * ユーザー登録
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Register error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: '登録に失敗しました' };
        }
        throw new Error(errorData.detail || '登録に失敗しました');
      }

      const authData: AuthResponse = await response.json();
      
      // トークンを保存
      this.setToken(authData.access_token);
      
      console.log('Registration successful, token saved');
      return authData;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    this.clearToken();
    console.log('Logged out');
  }

  /**
   * 認証状態を確認
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export default new AuthService();
