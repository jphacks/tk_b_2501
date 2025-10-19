// src/screens/MapViewScreen.tsx

import React, { useState, useEffect } from 'react';
// 1. StyleSheetとSafeAreaViewをインポートします
import { StyleSheet, View, Text, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 2. react-native-mapsからMapViewとMarkerをインポートします
import MapView, { Marker, Region } from 'react-native-maps';
import { DATABASE_URL } from '@env';

// 3. APIが完成するまでの「ダミーのピンデータ」を作成します
//    東京の名所の座標をいくつか用意しましょう
const DUMMY_MARKERS = [
  {
    id: '1',
    coordinate: { latitude: 35.6586, longitude: 139.7454 },
    title: '東京タワー',
    description: 'ここで撮った写真1枚',
    source: require('./../assets/images/code.jpeg'),
  },
  {
    id: '2',
    coordinate: { latitude: 35.7101, longitude: 139.8107 },
    title: '東京スカイツリー',
    description: 'ここで撮った写真2枚',
    source: require('./../assets/images/kazu.jpeg'),
  },
  {
    id: '3',
    coordinate: { latitude: 35.6812, longitude: 139.7671 },
    title: '東京駅',
    description: 'ここで撮った写真3枚',
    source: require('./../assets/images/東大.jpeg'),
  },
];

type Nearby_Photos = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  accuracy_m: number;
  address: string;
  visibility: string;
  taken_at: string;
  user_id: string;
  s3_key: string;
  mime_type: string;
  size_bytes: number;
  exif: Record<string, unknown>;
  created_at: string;
};

const MapViewScreen = () => {

  const [markers, setMarkers] = useState<Nearby_Photos[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 35.6895,
    longitude: 139.6917,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const BACKEND = DATABASE_URL;
  const fetchNearbyPhotos = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BACKEND}/photos/nearby/photos?lat=${lat}&lng=${lng}`
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data: Nearby_Photos[] = await res.json();
      setMarkers(data);
    } catch (error) {
      console.error('Error fetching markers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyPhotos(region.latitude, region.longitude);
  }, []);

  const onRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    await fetchNearbyPhotos(newRegion.latitude, newRegion.longitude);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 4. 他の画面と共通のヘッダーを設置します */}
      <View style={styles.header}>
        <Text style={styles.appName}>AppName</Text>
      </View>

      {/* 5. MapViewコンポーネントを設置します */}
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {DUMMY_MARKERS.map((marker)=>(
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}>
            <View style={styles.markerContainer}>
              <Image
            source={require('../assets/images/code.jpeg')}
            style={styles.markerImage}
            resizeMode="cover"/>
            </View>
          </Marker>
        ))}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.lat,
              longitude: marker.lng,
            }}
            title={marker.title}
            description={marker.description}>
              <View style={styles.markerContainer}>
              <Image
            // 6. マーカー画像のソースをS3キーから取得します
            source={{uri: `${BACKEND}/photos/photo?s3_key=${marker.s3_key}`}}
            style={styles.markerImage}
            resizeMode="cover"/>
              </View>
          </Marker>
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default MapViewScreen;
