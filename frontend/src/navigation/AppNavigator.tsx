// src/navigation/AppNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// 1. react-native-vector-iconsからアイコンコンポーネントをインポートします
import Icon from 'react-native-vector-icons/FontAwesome';

// 各画面コンポーネントをインポート
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import MapViewScreen from '../screens/MapViewScreen';
import SharedFeedScreen from '../screens/SharedFeedScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // 2. tabBarIconオプションをここに追加します
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'image'; // デフォルトのアイコン

          // 3. 表示しているルート(画面)の名前に応じて、表示するアイコンを切り替えます
          if (route.name === 'Gallery') {
            iconName = 'image';
          } else if (route.name === 'Map') {
            iconName = 'globe';
          } else if (route.name === 'Feed') {
            iconName = 'users';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          // 4. 設定した名前のアイコンコンポーネントを返します
          // focused（タブが選択されているか）に応じて見た目を変えることもできます
          return <Icon name={iconName} size={size} color={color} />;
        },
        // タブがアクティブな時の色と、非アクティブな時の色を設定
        tabBarActiveTintColor: '#C8B56F', // あなたのデザインに近い色
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* 5. 各タブのラベル（文字）を日本語に変更します（任意） */}
      <Tab.Screen name="Gallery" component={PhotoGalleryScreen} options={{ tabBarLabel: '写真' }} />
      <Tab.Screen name="Map" component={MapViewScreen} options={{ tabBarLabel: '地図' }} />
      <Tab.Screen name="Feed" component={SharedFeedScreen} options={{ tabBarLabel: '共有' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: '設定' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
