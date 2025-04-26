import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import axios from 'axios';

const ConfirmScreen = ({ route, navigation }) => {
  const { appointmentId, parentId, childId } = route.params || {}; // إضافة childId هنا
  const [isModalVisible, setModalVisible] = useState(true); // حالة ظهور النافذة
  const [appointmentDetails, setAppointmentDetails] = useState({ appointmentDay: '', appointmentTime: '' });

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // الشهر يبدأ من 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // جلب تاريخ ووقت الموعد عند تحميل الشاشة
  useEffect(() => {
    if (appointmentId) {
      axios
        .post('http://192.168.5.196:8888/APIS/get-appointment-time', { appointmentId })
        .then((response) => {
          setAppointmentDetails({
            appointmentDay: formatDate(response.data.appointmentDay), // تطبيق دالة التنسيق هنا
            appointmentTime: response.data.appointmentTime,
          });
        })
        .catch((error) => {
          console.error('خطأ في جلب تاريخ ووقت الموعد:', error);
          Alert.alert('خطأ', 'حدث خطأ أثناء جلب بيانات الموعد.');
        });
    }
  }, [appointmentId]);

  // التعامل مع التأكيد
  const handleConfirm = () => {
    console.log('تم تأكيد الموعد:', { appointmentId, parentId, childId });

    axios
      .post('http://192.168.5.196:8888/APIS/update-appointment', {
        appointmentId,
        parentId,
        childId,
      })
      .then((response) => {
        console.log('تم تحديث الموعد بنجاح:', response.data);
        Alert.alert('تم التأكيد', 'تم تأكيد الموعد بنجاح.');
        setModalVisible(false);
        navigation.goBack();
      })
      .catch((error) => {
        console.error('خطأ في تحديث الموعد:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الموعد.');
      });
  };

  // التعامل مع الإلغاء
  const handleCancel = () => {
    console.log('تم إلغاء الحجز:', { appointmentId, parentId, childId });
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel} // عند محاولة إغلاق النافذة
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            هل تريدين إلغاء حجزك وتثبيت حجز جديد في هذا الموعد؟
          </Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              تاريخ الموعد: <Text style={styles.boldText}>{appointmentDetails.appointmentDay}</Text>
            </Text>
            <Text style={styles.detailText}>
              وقت الموعد: <Text style={styles.boldText}>{appointmentDetails.appointmentTime}</Text>
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.buttonText}>تأكيد</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // الخلفية السوداء الشفافة مثل iPhone
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    width: width * 0.85,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign:"center",
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ConfirmScreen;
