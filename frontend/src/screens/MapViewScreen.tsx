// src/screens/MapViewScreen.tsx

import React from 'react';
// 1. StyleSheetとSafeAreaViewをインポートします
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 2. react-native-mapsからMapViewとMarkerをインポートします
import MapView, { Marker } from 'react-native-maps';

// 3. APIが完成するまでの「ダミーのピンデータ」を作成します
//    東京の名所の座標をいくつか用意しましょう
const DUMMY_MARKERS = [
  {
    id: '1',
    coordinate: { latitude: 35.6586, longitude: 139.7454 },
    title: '東京タワー',
    description: 'ここで撮った写真1枚',
  },
  {
    id: '2',
    coordinate: { latitude: 35.7101, longitude: 139.8107 },
    title: '東京スカイツリー',
    description: 'ここで撮った写真2枚',
  },
  {
    id: '3',
    coordinate: { latitude: 35.6812, longitude: 139.7671 },
    title: '東京駅',
    description: 'ここで撮った写真3枚',
  },
];

const MapViewScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 4. 他の画面と共通のヘッダーを設置します */}
      <View style={styles.header}>
        <Text style={styles.appName}>AppName</Text>
      </View>

      {/* 5. MapViewコンポーネントを設置します */}
      <MapView
        style={styles.map}
        // 地図の初期表示位置と縮尺を設定します（これは東京中心の座標です）
        initialRegion={{
          latitude: 35.6895,
          longitude: 139.6917,
          latitudeDelta: 0.1, // 数値が小さいほどズームイン
          longitudeDelta: 0.1,
        }}
      >
        {/* 6. ダミーデータをループして、地図上にピン（Marker）を配置します */}
        {DUMMY_MARKERS.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
};

// 7. 地図用の新しいスタイルを定義します
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'black',
    paddingVertical: 15,
    alignItems: 'center',
  },
  appName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    // 地図がヘッダー以外の全てのスペースを埋めるようにします
    flex: 1,
  },
});

export default MapViewScreen;
