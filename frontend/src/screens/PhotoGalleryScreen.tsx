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
  Alert,
  Image,
  ActivityIndicator,
  Modal, // ★ Modal をインポート
  Pressable, // ★ Pressable をインポート (モーダルの背景タップ用)
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

// 3. サービスとフックをインポート
import photoService from '../services/photoService';
import { useImagePicker } from '../hooks/useImagePicker';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 20) / 2; // アイテムサイズを計算

// 画像データ構造（ローカル画像とAPI画像の両方に対応）
interface Photo {
  id: string;
  name: string; // 画像の名前
  source?: ReturnType<typeof require>; // require() の戻り値の型（ローカル画像の場合）
  uri?: string; // API画像のURL
  createdAt: number; // ソート用の仮のタイムスタンプ (追加日時)
}

// 型エイリアス（後方互換性のため）
type LocalPhoto = Photo;

// ローカル画像データ (ここは変更なし)
const LOCAL_PHOTOS_DATA: LocalPhoto[] = [
  { id: '1', name: 'Code', source: require('./../assets/images/code.jpeg'), createdAt: 1729236000000 },
  { id: '2', name: 'Kazu', source: require('./../assets/images/kazu.jpeg'), createdAt: 1729236120000 },
  { id: '3', name: 'Nabeshima', source: require('./../assets/images/nabeshima.jpeg'), createdAt: 1729235880000 },
  { id: '4', name: 'スクショ', source: require('./../assets/images/スクショ.png'), createdAt: 1729236180000 },
  { id: '5', name: '小テスト', source: require('./../assets/images/小テスト.jpeg'), createdAt: 1729236240000 },
  { id: '6', name: '東大', source: require('./../assets/images/東大.jpeg'), createdAt: 1729236300000 },
  { id: '7', name: '6号館屋上', source: require('./../assets/images/6号館屋上.jpeg') , createdAt: 1729236360000 },
  { id: '8', name: '6号館屋上2', source: require('./../assets/images/6号館屋上2.jpeg') , createdAt: 1729236420000 },
  { id: '9', name: 'Murakami', source: require('./../assets/images/murakami.jpeg') , createdAt: 1729236480000 },
  { id: '10', name: 'Murakami 2', source: require('./../assets/images/murakami2.jpeg') , createdAt: 1729236540000 },
  { id: '11', name: '一号館', source: require('./../assets/images/一号館.jpeg') , createdAt: 1729236600000 },
  // { id: '12', name: '学祭 TUS', source: require('./../assets/images/学祭.TUS.JPG') ,createdAt: 1729236660000 }, // エラーが出た行はコメントアウトのまま
  // { id: '13', name: '時間割', source: require('./../assets/images/時間割.PNG') ,createdAt: 1729236720000 }, // エラーが出た行はコメントアウトのまま
];

// ソート順序の型定義 (変更なし)
type SortOrder = 'added_desc' | 'added_asc' | 'random';

// --- 1. ソートオプションを定義 ---
const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'added_desc', label: '追加日が新しい順' },
  { key: 'added_asc', label: '追加日が古い順' },
  { key: 'random', label: 'ランダム' },
];

const PhotoGalleryScreen = () => {
  // 状態変数: 表示する写真リスト、ソート順序、ローディング状態
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('added_desc');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // --- 2. Modal表示状態を再追加 ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 画像ピッカーフックを使用
  const { showImagePicker } = useImagePicker();

  // APIから写真を取得する関数
  const loadPhotosFromAPI = async (): Promise<Photo[]> => {
    try {
      const response = await photoService.getPhotos(0, 100);
      console.log('Fetched photos from API:', response.items.length);
      
      return response.items.map(photo => {
        // s3_keyには既にS3のフルURLが入っている
        console.log('Photo:', photo.id, 'URL:', photo.s3_key);
        return {
          id: photo.id,
          name: photo.title || '無題',
          uri: photo.s3_key, // S3のURLを直接使用
          createdAt: new Date(photo.created_at).getTime(),
        };
      });
    } catch (error) {
      console.error('Failed to fetch photos from API:', error);
      return [];
    }
  };

  // ソート関数（ローカル画像とAPI画像を結合）
  const fetchAndSortLocalPhotos = async (currentSortOrder: SortOrder) => {
    setLoading(true);
    console.log(`Sorting photos: ${currentSortOrder}`);
    
    // APIから写真を取得
    const apiPhotos = await loadPhotosFromAPI();
    
    // ローカル画像とAPI画像を結合
    const allPhotos = [...LOCAL_PHOTOS_DATA, ...apiPhotos];
    
    await new Promise(resolve => setTimeout(() => resolve(undefined), 50));
    let sortedPhotos: Photo[];
    if (currentSortOrder === 'random') {
      sortedPhotos = [...allPhotos];
      for (let i = sortedPhotos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedPhotos[i], sortedPhotos[j]] = [sortedPhotos[j], sortedPhotos[i]];
      }
    } else {
      sortedPhotos = [...allPhotos].sort((a, b) => {
        if (currentSortOrder === 'added_asc') {
          return a.createdAt - b.createdAt;
        } else {
          return b.createdAt - a.createdAt;
        }
      });
    }
    setPhotos(sortedPhotos);
    setLoading(false);
  };

  // 写真をアップロードする関数
  const handlePhotoUpload = async () => {
    try {
      setUploading(true);
      const imageResult = await showImagePicker();
      
      if (imageResult) {
        console.log('Uploading image:', imageResult.uri);
        await photoService.uploadPhoto(imageResult.uri, {
          title: '新しい写真',
          visibility: 'PUBLIC', // 開発環境ではPUBLICに設定
          description: 'React Nativeからアップロード',
        });
        
        // 写真を再読み込み
        await fetchAndSortLocalPhotos(sortOrder);
        Alert.alert('成功', '写真をアップロードしました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      const errorMessage = error instanceof Error ? error.message : '写真のアップロードに失敗しました';
      Alert.alert('エラー', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchAndSortLocalPhotos(sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  // --- 4. 現在のソート順のラベルを取得する関数を再追加 ---
  const getCurrentSortLabel = () => {
    return SORT_OPTIONS.find(option => option.key === sortOrder)?.label || '表示順序';
  };

  // --- 5. ソートオプション選択時の処理を再追加 ---
  // --- ソートオプション選択時の処理を変更 ---
  const handleSortSelect = (selectedSortKey: SortOrder) => {
    setIsModalVisible(false); // 先にモーダルを閉じる

    if (selectedSortKey === 'random') {
      // ★ ランダムが選択された場合 ★
      // sortOrder が既に 'random' であっても、強制的に再シャッフルを実行
      fetchAndSortLocalPhotos('random');
      // 状態も 'random' に設定（既に 'random' でも問題ない）
      setSortOrder('random');
    } else {
      // ★ ランダム以外が選択された場合 ★
      // 通常通り sortOrder を更新する (useEffect がソートを実行する)
      setSortOrder(selectedSortKey);
    }
  };

  // --- FlatList の各写真アイテムをレンダリングする関数 ---
  const renderPhotoItem = ({ item }: { item: Photo }) => {
    // 画像ソースを決定
    const imageSource = item.source ? item.source : { uri: item.uri };
    
    return (
      <TouchableOpacity style={styles.photoItem}>
        <Image 
          source={imageSource} 
          style={styles.photoImage} 
          resizeMode="cover"
          onError={(error) => {
            console.error('Image load error for', item.name, ':', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', item.name);
          }}
        />
        <Text style={styles.photoName} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.appName}>GeoPhoto</Text>
      </View>

      {/* --- 3. ソートボタン: タップでモーダルを開くように再変更 --- */}
      <TouchableOpacity
        style={styles.sortContainer}
        onPress={() => setIsModalVisible(true)} // モーダルを開く
        disabled={loading}
      >
        <Text style={styles.sortText}>{getCurrentSortLabel()}</Text> {/* 現在のソート順を表示 */}
        <Icon name="chevron-down" size={12} color="#555" />
      </TouchableOpacity>

      {/* ローディング表示または写真リスト */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C8B56F" />
          <Text style={styles.loadingText}>写真を読み込み中...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Icon name="image" size={50} color="#CCCCCC" />
               <Text style={styles.emptyText}>写真がありません</Text>
               <Text style={styles.emptySubText}>+ボタンから写真を追加してください</Text>
             </View>
          }
        />
      )}

      {/* フローティングアクションボタン（写真追加ボタン） */}
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

      {/* --- 6. Modalコンポーネントを再追加 --- */}
      <Modal
        animationType="fade" // アニメーションの種類
        transparent={true}    // 背景を透過
        visible={isModalVisible} // 表示状態
        onRequestClose={() => setIsModalVisible(false)} // 閉じるリクエスト
      >
        {/* モーダルの背景 */}
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          {/* モーダルのコンテンツ */}
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>表示順序</Text>
            {/* ソートオプションのリスト */}
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  sortOrder === option.key && styles.modalOptionSelected // 選択中のスタイル
                ]}
                onPress={() => handleSortSelect(option.key)} // 選択時の処理
              >
                <Text style={[
                  styles.modalOptionText,
                  sortOrder === option.key && styles.modalOptionTextSelected // 選択中のテキストスタイル
                ]}>
                  {option.label}
                </Text>
                {/* チェックマーク */}
                {sortOrder === option.key && (
                  <Icon name="check" size={16} color="#C8B56F" />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// --- スタイル定義 ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: 'black', paddingVertical: 15, alignItems: 'center' },
  appName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, justifyContent: 'flex-end', backgroundColor: '#EAEAEA', borderBottomWidth: 1, borderBottomColor: '#DDD' },
  sortText: { marginRight: 5, color: '#555' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  listContent: { paddingHorizontal: 5, paddingBottom: 80 },
  photoItem: { width: ITEM_SIZE, margin: 5, alignItems: 'center' },
  photoImage: { width: '100%', height: ITEM_SIZE * 1.2, borderRadius: 8, backgroundColor: '#E0E0E0' },
  photoName: { marginTop: 5, color: '#333', fontSize: 12, textAlign: 'center' },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#666' },
  emptySubText: { marginTop: 5, fontSize: 12, color: '#999', textAlign: 'center' },
  
  // FABのスタイル
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabDisabled: {
    backgroundColor: '#CCCCCC',
  },

  // --- モーダル用のスタイル ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionSelected: {
    // backgroundColor: '#F0EAD6', // 必要なら選択中の背景色を追加
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#C8B56F',
    fontWeight: 'bold',
  },
});

export default PhotoGalleryScreen;
