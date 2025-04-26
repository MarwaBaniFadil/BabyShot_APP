import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Keyboard
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import AsyncStorage from '@react-native-async-storage/async-storage'; // لإضافة AsyncStorage
import jwt_decode from 'jwt-decode'; // لإستخراج البيانات من التوكن

const AdminCancelAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage', error);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSendNotification = async () => {
    if (!reason.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة سبب الإلغاء.');
      return;
    }

    if (!token) {
      Alert.alert('خطأ', 'لم يتم العثور على التوكن.');
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      const clinicId = decodedToken.clinic_id;

      if (!clinicId) {
        Alert.alert('خطأ', 'لم يتم العثور على معرف العيادة في التوكن.');
        return;
      }

      const formattedDate = selectedDate.toLocaleDateString('en-CA');

      const response = await axios.post(`${ipAdd}:8888/APIS/cancel-appointments`, {
        appointment_date: formattedDate,
        reason,
        clinic_id: clinicId,
      });

      if (response.status === 200) {
        Alert.alert('نجاح', 'تم إرسال الإشعارات للأهالي بنجاح.');
        setReason('');
        Keyboard.dismiss;
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الإشعارات.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إلغاء المواعيد</Text>

      <Text style={styles.label}>حدد تاريخ اليوم الذي تريد إلغاء مواعيده:</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateButtonText}>اختيار التاريخ</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()} // يمنع اختيار التواريخ الماضية

        />
      )}

      <Text style={styles.dateText}>
      التاريخ المحدد: {selectedDate.toLocaleDateString('en-CA')}
      </Text>

      <Text style={styles.label}>سبب الإلغاء:</Text>
      <TextInput
        style={styles.input}
        value={reason}
        onChangeText={setReason}
        placeholder="اكتب سبب الإلغاء"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSendNotification}
      >
        <Text style={styles.submitButtonText}>إرسال الإشعار</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image
          source={require('../images/noti.png')} // ضع مسار الصورة هنا
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e6f0ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 50,
    marginTop:20,
    textAlign: 'center',
    color: '#4e54c8',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: '#444',
    textAlign:"right",
    fontWeight:"bold"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    textAlign:"right",
  },
  dateButton: {
    backgroundColor: '#7494ec',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight:"bold",
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign:"center"
  },
  submitButton: {
    backgroundColor: '#7494ec',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
  },
});

export default AdminCancelAppointments;
