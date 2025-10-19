// src/components/PhotoUploadModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

export interface PhotoUploadFormData {
  title: string;
  description: string;
  lat?: number;
  lng?: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  taken_at: string;
}

interface PhotoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PhotoUploadFormData) => void;
  imageUri?: string;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [takenAt] = useState(new Date());

  // 初期地図位置（東京）
  const initialRegion = {
    latitude: 35.6895,
    longitude: 139.6917,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    const formData: PhotoUploadFormData = {
      title: title.trim(),
      description: description.trim(),
      lat: selectedLocation?.latitude,
      lng: selectedLocation?.longitude,
      visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      taken_at: takenAt.toISOString(),
    };

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    // フォームをリセット
    setTitle('');
    setDescription('');
    setIsPublic(true);
    setSelectedLocation(null);
    setShowMap(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Icon name="times" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>写真の詳細</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitButton}>投稿</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* タイトル */}
          <View style={styles.section}>
            <Text style={styles.label}>
              タイトル <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="タイトルを入力"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* 説明 */}
          <View style={styles.section}>
            <Text style={styles.label}>説明</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="説明を入力"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* 撮影日時 - 現在は現在時刻を自動設定 */}
          <View style={styles.section}>
            <Text style={styles.label}>撮影日時</Text>
            <View style={styles.dateButton}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.dateText}>
                {takenAt.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.dateHelper}>(現在時刻)</Text>
            </View>
          </View>

          {/* 位置情報 */}
          <View style={styles.section}>
            <Text style={styles.label}>位置情報</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowMap(!showMap)}
            >
              <Icon
                name={selectedLocation ? 'map-marker' : 'map-o'}
                size={16}
                color={selectedLocation ? '#C8B56F' : '#666'}
              />
              <Text style={styles.locationButtonText}>
                {selectedLocation
                  ? `緯度: ${selectedLocation.latitude.toFixed(6)}, 経度: ${selectedLocation.longitude.toFixed(6)}`
                  : '地図上でタップして位置を選択'}
              </Text>
            </TouchableOpacity>

            {showMap && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={
                    selectedLocation
                      ? {
                          ...initialRegion,
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                        }
                      : initialRegion
                  }
                  onPress={handleMapPress}
                >
                  {selectedLocation && (
                    <Marker coordinate={selectedLocation} />
                  )}
                </MapView>
                {selectedLocation && (
                  <TouchableOpacity
                    style={styles.clearLocationButton}
                    onPress={() => setSelectedLocation(null)}
                  >
                    <Icon name="times-circle" size={20} color="#FF3B30" />
                    <Text style={styles.clearLocationText}>位置をクリア</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* 公開設定 */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>公開設定</Text>
                <Text style={styles.helperText}>
                  {isPublic ? '公開 - 誰でも閲覧できます' : 'プライベート - 自分のみ閲覧可能'}
                </Text>
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  {isPublic ? '公開' : '非公開'}
                </Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: '#767577', true: '#C8B56F' }}
                  thumbColor={isPublic ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C8B56F',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dateHelper: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  mapContainer: {
    marginTop: 12,
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
  clearLocationButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearLocationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default PhotoUploadModal;
