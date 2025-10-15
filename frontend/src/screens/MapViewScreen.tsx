/* 地図表示画面 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapViewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>地図表示（Map View）</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});

export default MapViewScreen;
