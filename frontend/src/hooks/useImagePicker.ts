// src/hooks/useImagePicker.ts

import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
}

export const useImagePicker = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showImagePicker = (): Promise<ImagePickerResult | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        '写真を選択',
        '写真の取得方法を選択してください',
        [
          {
            text: 'カメラ',
            onPress: () => openCamera(resolve),
          },
          {
            text: 'ギャラリー',
            onPress: () => openImageLibrary(resolve),
          },
          {
            text: 'キャンセル',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  };

  const openCamera = (resolve: (result: ImagePickerResult | null) => void) => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 2048,
      maxHeight: 2048,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      handleImageResponse(response, resolve);
    });
  };

  const openImageLibrary = (resolve: (result: ImagePickerResult | null) => void) => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 2048,
      maxHeight: 2048,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      handleImageResponse(response, resolve);
    });
  };

  const handleImageResponse = (
    response: ImagePickerResponse,
    resolve: (result: ImagePickerResult | null) => void
  ) => {
    if (response.didCancel || response.errorMessage) {
      resolve(null);
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      if (asset.uri) {
        const result: ImagePickerResult = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize || 0,
        };
        resolve(result);
      } else {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  };

  return {
    showImagePicker,
    isLoading,
  };
};
