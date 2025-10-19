// src/screens/SignUpScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './LoginScreen';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

// 2. バックエンドサーバーのベースURLを定義します。
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 3. handleSignUpをasync関数に変更します
  const handleSignUp = async () => {
    // 入力が空でないか簡単なチェック
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      // 4. fetchを使用して、バックエンドの /auth/register エンドポイントにPOSTリクエストを送信
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // 5. emailとpasswordをJSON形式の文字列に変換してbodyに含める
        body: JSON.stringify({
          email: email,
          username: username,
          password: password,
        }),
      });

      // 6. レスポンスからJSONデータを取得
      const data = await response.json();

      // 7. レスポンスが成功でなかった場合 (例: 400, 500エラー)
      if (!response.ok) {
        // バックエンドからのエラーメッセージがあれば表示、なければ汎用メッセージ
        throw new Error(data.message || '登録に失敗しました。');
      }

      // 8. 登録成功！
      console.log('登録成功:', data);
      Alert.alert('成功', 'ユーザー登録が完了しました！ログインページに移動します。');
      navigation.navigate('Login'); // 成功したらログインページに自動で遷移

    } catch (error: any) {
      // 9. ネットワークエラーや上記で投げられたエラーをキャッチ
      console.error('登録エラー:', error);
      Alert.alert('登録エラー', error.message);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.appName}>AppName</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign Up</Text>
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
            placeholder="Username"
            placeholderTextColor="#888"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Already registered?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Log In.</Text>
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
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footerText: { marginTop: 20, textAlign: 'center', color: '#555' },
  linkText: { color: '#007AFF', fontWeight: 'bold' },
});


export default SignUpScreen;
