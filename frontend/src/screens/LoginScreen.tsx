// src/screens/LoginScreen.tsx

// 1. 从 'react' 导入 useState
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, // 导入 Alert 用于简单的弹窗提示
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  // 2. 创建两个 "状态" 变量来存储输入框的内容
  // setEmail 和 setPassword 是用来更新它们的函数
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. 创建一个处理登录按钮点击的函数
  const handleLogin = () => {
    console.log('准备登录:', { email, password }); // 在控制台打印，方便调试
    // 这里是明天你要写真正 API 调用逻辑的地方！
    // 比如：const response = await api.login(email, password);
    Alert.alert('登录按钮被点击', `邮箱: ${email}\n密码: ${password}`);
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
            autoCapitalize="none" // 禁止首字母自动大写
            // 4. 将输入框的值绑定到我们的状态变量
            value={email}
            // 5. 当用户输入时，调用 setEmai 更新状态
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
          {/* 6. 让 Submit 按钮调用我们的 handleLogin 函数 */}
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

// 样式部分保持不变...
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
