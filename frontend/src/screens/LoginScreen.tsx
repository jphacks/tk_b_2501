// src/screens/LoginScreen.tsx

// 1. useStateとAlertに加えて、Platformをインポートします
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform, // OSを判定するためにインポート
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// RootStackParamListはSignUpScreenからインポートするように変更してもOKです
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLoginSuccess: () => void; // 「引数なしで何も返さない関数」という型
};

// 2. バックエンドサーバーのベースURLを定義します（SignUpScreenと同じもの）
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const LoginScreen = ({ navigation, onLoginSuccess }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. handleLoginをasync関数に変更します
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // バックエンドからのエラーメッセージを表示
        throw new Error(data.detail || 'ログインに失敗しました。');
      }

      // 5. ログイン成功！トークンを保存
      //    将来的には、AsyncStorageなどでトークンを保存します
      console.log('ログイン成功:', data);
      // data.access_token と data.refresh_token を保存する処理を追加
      onLoginSuccess();

    } catch (error: any) {
      // 6. エラーをキャッチして表示
      console.error('ログインエラー:', error);
      Alert.alert('ログインエラー', error.message);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.appName}>AppName</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Log In</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Not registered?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>Sign up here!</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

// スタイル部分は変更ありません
const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: 'black' },
  safeArea: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  appName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  formContainer: { backgroundColor: '#F5F5F5', flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
  submitButton: { backgroundColor: '#C8B56F', borderRadius: 8, padding: 15, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footerText: { marginTop: 20, textAlign: 'center', color: '#555' },
  linkText: { color: '#007AFF', fontWeight: 'bold' },
});


export default LoginScreen;
