/* 写真共有画面 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SharedFeedScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>写真共有 (Shared Feed)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});

export default SharedFeedScreen;
