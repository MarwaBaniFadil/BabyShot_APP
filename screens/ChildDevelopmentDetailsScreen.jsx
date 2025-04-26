import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>هذه صفحة فارغة</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // يمكنك تغيير الخلفية هنا
  },
  text: {
    fontSize: 18,
    color: '#000', // يمكنك تغيير لون النص هنا
  },
});

export default EmptyPage;
