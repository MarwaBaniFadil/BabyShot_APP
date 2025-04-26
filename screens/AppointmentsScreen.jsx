import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const AppointmentsScreen = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.box} onPress={navigateToAppointments}>
        <Image
          source={{uri: 'https://example.com/appointments-icon.png'}} // استبدل هذا الرابط بصورة تعبر عن مواعيد
          style={styles.icon}
        />
        <Text style={styles.text}>مواعيد</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.box} onPress={navigateToDeleteAndRecreate}>
        <Image
          source={{uri: 'https://example.com/delete-icon.png'}} // استبدل هذا الرابط بصورة تعبر عن حذف
          style={styles.icon}
        />
        <Text style={styles.text}>حذف وإعادة</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C4BCC', // نفس لون الخلفية في الصورة
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default AppointmentsScreen;
