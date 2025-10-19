// src/types/navigation.ts

export type RootStackParamList = {
  Gallery: undefined;
  Map: {
    latitude?: number;
    longitude?: number;
    photoId?: string;
    photoTitle?: string;
  };
  Feed: undefined;
  Settings: undefined;
};
