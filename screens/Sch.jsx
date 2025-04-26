import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // لاستخدام التنقل
import { Ionicons } from '@expo/vector-icons'; // لاستخدام الأيقونات
import photo from '../images/sch.jpg'; // استيراد الصورة

function Sch() {
  const navigation = useNavigation(); // استخدام التنقل

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={photo} style={styles.photo} />
      <Text style={styles.title}>إدارة المواعيد</Text>
      <Text style={styles.description}>
        يمكنك بكل سهولة حجز موعد جديد، تعديل مواعيدك أو حتى الاطلاع على المواعيد المحجوزة سابقاً
      </Text>

      <View style={styles.featuresContainer}>
        <TouchableOpacity
          style={styles.featureBox}
          onPress={() => navigation.navigate('Scheduler')} // التنقل إلى صفحة Scheduler
        >
          <Ionicons name="add-circle" size={40} color="#7494ec" style={styles.icon} />
          <Text style={styles.featureText}>إضافة موعد جديد</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureBox}
          onPress={() => navigation.navigate('FutureBookings')} // التنقل إلى صفحة FutureBookings
        >
          <Ionicons name="trash-bin" size={40} color="#7494ec" style={styles.icon} />
          <Text style={styles.featureText}>لرؤية مواعيدك أو حذفها </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
   backgroundColor:"#e6f0ff",
    minHeight: '100%',
  },
  photo: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    marginTop: 25,
    color: '#3969ec',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  featureBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    margin: 10,
  },
  icon: {
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight:"bold",
  },
  

});

export default Sch;
