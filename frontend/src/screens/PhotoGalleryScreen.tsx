/* 写真一覧画面 */
// src/screens/PhotoGalleryScreen.tsx

import React, { useState, useEffect } from 'react';
// 1. FlatList, SafeAreaView, TouchableOpacity などをインポートします
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions, // 画面のサイズを取得するためにインポート
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
// 2. アイコンも使えるようにインポートしておきます
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

// 3. サービスとフックをインポート
import photoService, { PhotoResponse } from '../services/photoService';
import { useImagePicker } from '../hooks/useImagePicker';

// 画面の横幅を取得し、2で割って写真アイテムのサイズを計算
const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 20) / 2; // (画面幅 - 左右の余白) / 2列

const PhotoGalleryScreen = () => {
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { showImagePicker } = useImagePicker();

  // 写真一覧を取得
  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getPhotos();
      setPhotos(response.items);
    } catch (error) {
      console.error('写真の読み込みエラー:', error);
      Alert.alert('エラー', '写真の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 写真をアップロード
  const handlePhotoUpload = async () => {
    try {
      setUploading(true);
      const imageResult = await showImagePicker();
      
      if (imageResult) {
        const uploadedPhoto = await photoService.uploadPhoto(imageResult.uri, {
          title: '新しい写真',
          visibility: 'PRIVATE',
        });
        
        // 写真一覧を更新
        setPhotos(prev => [uploadedPhoto, ...prev]);
        Alert.alert('成功', '写真をアップロードしました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      Alert.alert('エラー', '写真のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // 4. 写真アイテムをレンダリングするための関数
  const renderPhotoItem = ({ item }: { item: PhotoResponse }) => (
    <TouchableOpacity style={styles.photoItem}>
      <Image 
        source={{ uri: item.s3_key }} 
        style={styles.photoImage}
        resizeMode="cover"
      />
      <Text style={styles.photoName} numberOfLines={1}>
        {item.title || '無題'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C8B56F" />
          <Text style={styles.loadingText}>写真を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // SafeAreaViewでノッチなどを避けます
    <SafeAreaView style={styles.container}>
      {/* 1. ヘッダー部分 */}
      <View style={styles.header}>
        <Text style={styles.appName}>AppName</Text>
      </View>

      {/* 2. ソート順序のドロップダウン（今は見た目だけ） */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortText}>表示順序</Text>
        <Icon name="chevron-down" size={12} color="#555" />
      </View>

      {/* 3. 写真グリッド部分 */}
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={item => item.id}
        numColumns={2} // これで2列のグリッドになります
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadPhotos}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="image" size={50} color="#CCCCCC" />
            <Text style={styles.emptyText}>写真がありません</Text>
            <Text style={styles.emptySubText}>+ボタンから写真を追加してください</Text>
          </View>
        }
      />

      {/* 4. フローティングアクションボタン（写真追加ボタン） */}
      <TouchableOpacity 
        style={[styles.fab, uploading && styles.fabDisabled]} 
        onPress={handlePhotoUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Icon name="plus" size={24} color="white" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 5. 新しいスタイルを追加・変更します
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'flex-end',
    backgroundColor: '#EAEAEA',
  },
  sortText: {
    marginRight: 5,
    color: '#555',
  },
  listContent: {
    paddingHorizontal: 5, // 左右の少しの余白
  },
  photoItem: {
    width: ITEM_SIZE,
    margin: 5,
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2, // 少し縦長の写真にする
    borderRadius: 8,
    backgroundColor: '#CCCCCC', // 読み込み中の色
  },
  photoName: {
    marginTop: 5,
    color: '#333',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#C8B56F',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android用の影
    shadowColor: '#000', // iOS用の影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabDisabled: {
    backgroundColor: '#CCCCCC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
});

export default PhotoGalleryScreen;