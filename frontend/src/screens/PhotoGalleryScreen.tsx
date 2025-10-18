/* 写真一覧画面 */
// src/screens/PhotoGalleryScreen.tsx

import React, { useState } from 'react';
// 1. FlatList, SafeAreaView, TouchableOpacity などをインポートします
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions, // 画面のサイズを取得するためにインポート
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
// 2. アイコンも使えるようにインポートしておきます
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
// 画像ピッカー（ネイティブの画像選択ダイアログを開きます）
import { launchImageLibrary } from 'react-native-image-picker';

// 3. APIが完成するまでの「ダミーデータ」を作成します
//    8つの空のオブジェクトを用意し、写真のプレースホルダーとして使います
const DUMMY_DATA = [
  { id: '1', name: 'photo_1' },
  { id: '2', name: 'photo_2' },
  { id: '3', name: 'photo_3' },
  { id: '4', name: 'photo_4' },
  { id: '5', name: 'photo_5' },
  { id: '6', name: 'photo_6' },
  { id: '7', name: 'photo_7' },
  { id: '8', name: 'photo_8' },
];

// 画面の横幅を取得し、2で割って写真アイテムのサイズを計算
const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 20) / 2; // (画面幅 - 左右の余白) / 2列

const PhotoGalleryScreen = () => {
  const [uploading, setUploading] = useState(false);

  // 画像選択 → アップロードの処理
  const pickAndUploadImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1 },
      async (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('エラー', `画像選択に失敗しました: ${response.errorMessage || response.errorCode}`);
          return;
        }

        const asset = response.assets && response.assets[0];
        if (!asset || !asset.uri) {
          Alert.alert('エラー', '選択された画像が取得できませんでした');
          return;
        }

        try {
          setUploading(true);

          const uri = asset.uri;
          // ファイル名と MIME タイプを準備
          const name = asset.fileName || `photo.${(asset.type && asset.type.split('/')[1]) || 'jpg'}`;
          const type = asset.type || 'image/jpeg';

          const formData = new FormData();
          // React Native の FormData は { uri, name, type } のオブジェクトを受け取ります
          formData.append('file', {
            uri: Platform.OS === 'ios' && uri.startsWith('file://') ? uri : uri,
            name,
            type,
          } as any);

          // 任意でタイトル/説明を付ける例
          // formData.append('title', 'Uploaded from app');

          // バックエンドの URL（開発環境では適宜変更してください）
          const BACKEND = 'http://localhost:8000';

          const res = await fetch(`${BACKEND}/photos/upload`, {
            method: 'POST',
            body: formData,
            // RN の fetch + FormData では Content-Type を明示的にセットしないこと
            headers: {
              Accept: 'application/json',
            },
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
          }

          Alert.alert('完了', '画像をアップロードしました');
        } catch (err: any) {
          Alert.alert('アップロード失敗', err.message || String(err));
        } finally {
          setUploading(false);
        }
      }
    );
  };
  // 4. 写真アイテムをレンダリングするための関数
  const renderPhotoItem = ({ item }: { item: { id: string, name: string } }) => (
    <View style={styles.photoItem}>
      {/* 写真のプレースホルダー */}
      <View style={styles.photoPlaceholder} />
      <Text style={styles.photoName}>{item.name}</Text>
    </View>
  );

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
        data={DUMMY_DATA}
        renderItem={renderPhotoItem}
        keyExtractor={item => item.id}
        numColumns={2} // これで2列のグリッドになります
        contentContainerStyle={styles.listContent}
      />

      {/* 4. フローティングアクションボタン（写真追加ボタン） */}
      <TouchableOpacity style={styles.fab} onPress={pickAndUploadImage} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="white" />
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
  photoPlaceholder: {
    width: '100%',
    height: ITEM_SIZE * 1.2, // 少し縦長の写真にする
    backgroundColor: '#CCCCCC', // 写真のダミー色
    borderRadius: 8,
  },
  photoName: {
    marginTop: 5,
    color: '#333',
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
});

export default PhotoGalleryScreen;
