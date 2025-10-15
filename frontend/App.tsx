import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 認証フロー（ログイン・新規登録）の画面
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// ログイン後のメインアプリのナビゲーター
import AppNavigator from './src/navigation/AppNavigator';

import type { RootStackParamList } from './src/screens/LoginScreen';

// 認証フロー用のナビゲーター
const AuthStack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  // ★★★ ここが最重要！ ★★★
  // 本来はユーザーのログイン状態（トークンの有無など）を管理しますが、
  // 今は開発のために、仮の変数で表示を切り替えます。
  // この値を false に変えると、ログイン画面が表示されます。
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        // 【ログインしている場合】メインのタブナビゲーションを表示
        <AppNavigator />
      ) : (
        // 【ログインしていない場合】認証用のスタックナビゲーションを表示
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
