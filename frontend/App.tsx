// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 导入我们的两个屏幕
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
// 1. 导入我们定义的“嘉宾名单”类型
import type { RootStackParamList } from './src/screens/LoginScreen';

// 2. 在创建导航器时，告诉它我们的“嘉宾名单”是什么
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* 现在，TypeScript 知道 'Login' 是合法的 name，
            LoginScreen 是合法的 component */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* 'SignUp' 和 SignUpScreen 也是合法的了 */}
        <Stack.Screen name="SignUp" component={SignUpScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
