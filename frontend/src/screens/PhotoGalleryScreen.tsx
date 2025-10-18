// src/screens/PhotoGalleryScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  // Platform, // iOS専用になったので不要
  ActivityIndicator,
  Image, // Image コンポーネントをインポート
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker'; // 画像ピッカーをインポート

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 20) / 2; // アイテムサイズを計算

// --- ローカル画像データ構造 (takenAt を削除) ---
interface LocalPhoto {
  id: string;
  name: string; // 画像の名前
  source: ReturnType<typeof require>; // require() の戻り値の型
  createdAt: number; // ソート用の仮のタイムスタンプ (追加日時)
}

// --- ローカル画像データを準備 (takenAt を削除) ---
const LOCAL_PHOTOS_DATA: LocalPhoto[] = [
  { id: '1', name: 'Code', source: require('./../assets/images/code.jpeg'), createdAt: 1729236000000 },
  { id: '2', name: 'Kazu', source: require('./../assets/images/kazu.jpeg'), createdAt: 1729236120000 },
  { id: '3', name: 'Nabeshima', source: require('./../assets/images/nabeshima.jpeg'), createdAt: 1729235880000 },
  { id: '4', name: 'スクショ', source: require('./../assets/images/スクショ.png'), createdAt: 1729236180000 },
  { id: '5', name: '小テスト', source: require('./../assets/images/小テスト.jpeg'), createdAt: 1729236240000 },
  { id: '6', name: '東大', source: require('./../assets/images/東大.jpeg'), createdAt: 1729236300000 },
  // 必要に応じて画像を追加
  { id: '7', name: '6号館屋上', source: require('./../assets/images/6号館屋上.jpeg') , createdAt: 1729236360000 },
  { id: '8', name: '6号館屋上2', source: require('./../assets/images/6号館屋上2.jpeg') , createdAt: 1729236420000 },
  { id: '9', name: 'Murakami', source: require('./../assets/images/murakami.jpeg') , createdAt: 1729236480000 },
  { id: '10', name: 'Murakami 2', source: require('./../assets/images/murakami2.jpeg') , createdAt: 1729236540000 },
  { id: '11', name: '一号館', source: require('./../assets/images/一号館.jpeg') , createdAt: 1729236600000 },
];

// --- 1. SortOrder 型から撮影日時のオプションを削除 ---
type SortOrder = 'added_desc' | 'added_asc' | 'random';

const PhotoGalleryScreen = () => {
  // 状態変数: 表示する写真リスト、ソート順序、ローディング状態、アップロード状態
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  // 初期値を 'added_desc' (追加日が新しい順) に戻すなど、お好みで
  const [sortOrder, setSortOrder] = useState<SortOrder>('added_desc');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // アップロード処理中の状態 (FAB用)

  // --- 4. ソート関数から撮影日時のロジックを削除 ---
  const fetchAndSortLocalPhotos = async (currentSortOrder: SortOrder) => {
    setLoading(true); // ローディング開始
    console.log(`Sorting local photos: ${currentSortOrder}`);
    // わずかな遅延を入れて非同期処理を模倣 (UIが固まらないように)
    await new Promise(resolve => setTimeout(resolve, 50));

    let sortedPhotos: LocalPhoto[];

    if (currentSortOrder === 'random') {
      // Fisher-Yates (Knuth) Shuffle アルゴリズムで配列をシャッフル
      sortedPhotos = [...LOCAL_PHOTOS_DATA];
      for (let i = sortedPhotos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedPhotos[i], sortedPhotos[j]] = [sortedPhotos[j], sortedPhotos[i]]; // 要素を入れ替え
      }
    } else {
      // 追加日でのソート
      sortedPhotos = [...LOCAL_PHOTOS_DATA].sort((a, b) => {
        if (currentSortOrder === 'added_asc') {
          return a.createdAt - b.createdAt; // 古い順
        } else { // 'added_desc' (デフォルト含む)
          return b.createdAt - a.createdAt; // 新しい順
        }
      });
    }

    setPhotos(sortedPhotos); // ソートされたリストで状態を更新
    setLoading(false); // ローディング終了
  };

  // --- コンポーネント初回表示時と、sortOrderが変更された時に写真データを更新 ---
  useEffect(() => {
    fetchAndSortLocalPhotos(sortOrder);
  }, [sortOrder]); // sortOrder が変更されるたびに実行

  // --- 2. ソート切り替えロジックを3つの状態サイクルに変更 ---
  const changeSortOrder = () => {
    let nextSortOrder: SortOrder;
    switch (sortOrder) {
      case 'added_desc':
        nextSortOrder = 'added_asc'; // 新→古
        break;
      case 'added_asc':
        nextSortOrder = 'random';    // 古→ランダム
        break;
      case 'random': // ランダム→新
      default:
        nextSortOrder = 'added_desc';
        break;
    }
    setSortOrder(nextSortOrder); // 状態を更新 → useEffectが発火
  };

  // --- 3. 表示テキストから撮影日時を削除 ---
  const getSortOrderText = () => {
    switch (sortOrder) {
      case 'added_desc': return '追加日が新しい順';
      case 'added_asc': return '追加日が古い順';
      case 'random': return 'ランダム';
      default: return '表示順序';
    }
  };

  // --- 画像選択 → アップロードの処理 (現在は無効化) ---
  const pickAndUploadImage = () => {
    Alert.alert("お知らせ", "ローカル表示モードではアップロードできません。");
  };

  // --- FlatList の各写真アイテムをレンダリングする関数 ---
  const renderPhotoItem = ({ item }: { item: LocalPhoto }) => (
    <View style={styles.photoItem}>
      {/* ローカル画像を Image コンポーネントで表示 */}
      <Image source={item.source} style={styles.photoImage} />
      <Text style={styles.photoName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.appName}>AppName</Text>
      </View>

      {/* ソート順序表示・変更ボタン */}
      <TouchableOpacity style={styles.sortContainer} onPress={changeSortOrder} disabled={loading}>
        <Text style={styles.sortText}>{getSortOrderText()}</Text>
        <Icon name="chevron-down" size={12} color="#555" />
      </TouchableOpacity>

      {/* ローディング表示または写真リスト */}
      {loading ? (
        // ローディング中はインジケーターを表示
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C8B56F" />
        </View>
      ) : (
        // 写真リストを表示
        <FlatList
          data={photos} // ソートされた写真データを表示
          renderItem={renderPhotoItem} // 各アイテムの描画関数
          keyExtractor={item => item.id} // 各アイテムの一意なキー
          numColumns={2} // 2列表示
          contentContainerStyle={styles.listContent} // リスト全体のスタイル
          // 写真データが空の場合の表示
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>写真がありません。</Text>
              <Text style={styles.emptySubText}>src/assets/images/ に画像を追加し、</Text>
              <Text style={styles.emptySubText}>PhotoGalleryScreen.tsx の LOCAL_PHOTOS_DATA を編集してください。</Text>
            </View>
          }
        />
      )}

      {/* フローティングアクションボタン（写真追加）- 現在は無効 */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#AAA' }]} // 無効なのでグレーに
        onPress={pickAndUploadImage}
        disabled={true} // 無効化
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- スタイル定義 (変更なし) ---
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
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  sortText: {
    marginRight: 5,
    color: '#555',
  },
  loadingContainer: {
    flex: 1, // 中央表示のため
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 5, // グリッドの左右の余白
    paddingBottom: 80, // FABに隠れないように下部の余白
  },
  photoItem: {
    width: ITEM_SIZE,
    margin: 5, // アイテム間の余白
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2, // 画像の高さ (少し縦長)
    borderRadius: 8,
    backgroundColor: '#E0E0E0', // 画像読み込み中の背景色
  },
  photoName: {
    marginTop: 5,
    color: '#333',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#C8B56F', // 有効時の色
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
