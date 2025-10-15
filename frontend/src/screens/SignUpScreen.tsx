// src/screens/SignUpScreen.tsx

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
import type { RootStackParamList } from './LoginScreen';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
  // 2. 为注册页面也创建独立的 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. 创建一个处理注册按钮点击的函数
  const handleSignUp = () => {
    console.log('准备注册:', { email, password });
    // 明天在这里调用注册 API
    // 比如：const response = await api.register(email, password);
    Alert.alert('注册按钮被点击', `邮箱: ${email}\n密码: ${password}`);
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
            // 4. 绑定 value 和 onChangeText
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
          {/* 5. 绑定 onPress 事件 */}
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

// 样式部分保持不变
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
