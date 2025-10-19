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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import authService from '../services/authService';

// RootStackParamListはSignUpScreenからインポートするように変更してもOKです
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLoginSuccess: () => void; // 「引数なしで何も返さない関数」という型
};

const LoginScreen = ({ navigation, onLoginSuccess }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 開発用: テストトークンで認証をスキップ
  const handleSkipLogin = () => {
    const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZjExN2U1Zi1lNzRhLTQ5MGItYWRmYy01NjY1MDkwNjI5Y2YiLCJleHAiOjE3NjA4NTA3NTF9.yOKURDAvQlFxoZYepKPhUogbOPtQuBscNpChXKpEcr8';
    authService.setToken(TEST_TOKEN);
    console.log('Development mode: Using test token');
    Alert.alert('開発モード', 'テストトークンを設定しました', [
      { text: 'OK', onPress: onLoginSuccess },
    ]);
  };

  // 3. handleLoginをasync関数に変更し、authServiceを使用
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      setLoading(true);
      // authServiceを使用してログイン
      const data = await authService.login({ email, password });
      
      // 5. ログイン成功！トークンは既にauthServiceに保存されています
      console.log('ログイン成功:', data);
      Alert.alert('成功', 'ログインしました', [
        { text: 'OK', onPress: onLoginSuccess },
      ]);

    } catch (error: any) {
      // 6. エラーをキャッチして表示
      console.error('ログインエラー:', error);
      Alert.alert('ログインエラー', error.message);
    } finally {
      setLoading(false);
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
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>

          {__DEV__ && (
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleSkipLogin}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>スキップ（開発用）</Text>
            </TouchableOpacity>
          )}

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

// スタイル部分
const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: 'black' },
  safeArea: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  appName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  formContainer: { backgroundColor: '#F5F5F5', flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
  submitButton: { backgroundColor: '#C8B56F', borderRadius: 8, padding: 15, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#CCCCCC' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  skipButton: { 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#C8B56F', 
    borderRadius: 8, 
    padding: 15, 
    alignItems: 'center', 
    marginTop: 10 
  },
  skipButtonText: { color: '#C8B56F', fontSize: 16, fontWeight: 'bold' },
  footerText: { marginTop: 20, textAlign: 'center', color: '#555' },
  linkText: { color: '#007AFF', fontWeight: 'bold' },
});


export default LoginScreen;
