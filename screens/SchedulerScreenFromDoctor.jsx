import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons'; // استيراد الأيقونات
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const ParentChildrenScreen = () => {
  const [clinicId, setClinicId] = useState(null);
  const [motherId, setMotherId] = useState('');
  const [parentID, setParentId] = useState('');
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null); // الطفل المختار
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null); // التايم سلوت المختار

  const timeSlots = [
    { time: '08:00' }, { time: '08:15' }, { time: '08:30' }, { time: '08:45' },
    { time: '09:00' }, { time: '09:15' }, { time: '09:30' }, { time: '09:45' },
    { time: '10:00' }, { time: '10:15' }, { time: '10:30' }, { time: '10:45' },
    { time: '11:00' }, { time: '11:15' }, { time: '11:30' }, { time: '11:45' },
    { time: '12:00' }, { time: '12:15' }, { time: '12:30' }, { time: '12:45' },
    { time: '13:00' }, { time: '13:15' }, { time: '13:30' }, { time: '13:45' }
  ];

  const fetchAppointments = async (clinicId, date) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/appointments/${date}/${clinicId}`);
      const bookedTimes = response.data.map((appointment) =>
        appointment.appointment_time.slice(0, 5)
      );
      setBookedSlots(bookedTimes || []);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
      setBookedSlots([]);
    }
  };

  useEffect(() => {
    const fetchClinicIdFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          if (decodedToken.clinic_id) {
            setClinicId(decodedToken.clinic_id);
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch or decode token');
      }
    };
    fetchClinicIdFromToken();
  }, []);

  useEffect(() => {
    if (clinicId && selectedDate) {
      fetchAppointments(clinicId, selectedDate);
    }
  }, [clinicId, selectedDate]);

  const handleMotherIdSubmit = async () => {
    if (!motherId) {
      Alert.alert('تنبيه', 'أدخل رقم الهوية رجاءً ! ');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/mother/${motherId}`);
      const motherData = response.data;
      setParentId(motherData.id);

      const childrenResponse = await axios.get(`${ipAdd}:8888/APIS/getChildrenByParentId/${motherData.id}`);
      setChildrenList(childrenResponse.data.users);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (slotTime) => {
    if (!selectedChild || !clinicId || !selectedDate) {
      Alert.alert('تنبيه','يرجى اختيار الطفل والتاريخ أولاً !');
      return;
    }

    try {
      const appointmentTime = `${slotTime}:00`;

      const appointmentData = {
        child_id: selectedChild.child_id,
        appointment_day: selectedDate,
        appointment_time: appointmentTime,
        status: 'مجدولة',
        reason: 'طعم',
        clinic_id: clinicId,
        doctor_id: null, // هنا يجب تحديد الـ doctor_id المناسب
        parent_id: parentID
      };

      const response = await axios.post(
        `${ipAdd}:8888/APIS/book-appointment`,
        appointmentData
      );

      if (response.status === 201) {
        const appointmentDate = new Date(`${selectedDate}T${slotTime}:00`);
        appointmentDate.setMinutes(appointmentDate.getMinutes() + 15); // إضافة 15 دقيقة
        const checkupTime = appointmentDate.toTimeString().slice(0, 5);

        const checkupAppointmentData = {
          child_id: selectedChild.child_id,
          appointment_day: selectedDate,
          appointment_time: `${checkupTime}:00`,
          status: 'مجدولة',
          reason: 'فحص',
          clinic_id: clinicId,
          doctor_id: null,
          parent_id: parentID
        };

        const checkupResponse = await axios.post(
          `${ipAdd}:8888/APIS/book-appointment`,
          checkupAppointmentData
        );

        if (checkupResponse.status === 201) {
          alert(`تم تثبيت هذا الحجز في الساعة ${appointmentTime} للطعم وراجع طبيب الأطفال في الساعة ${checkupTime} للفحص.`);
          fetchAppointments(clinicId, selectedDate);
        } else {
          throw new Error('حدث خطأ أثناء حجز موعد الفحص.');
        }
      } else {
        throw new Error('حدث خطأ أثناء حجز الموعد.');
      }
    } catch (err) {
      console.error('Error booking appointment:', err.message);
      alert('حدث خطأ أثناء حجز الموعد.');
    }
  };

  const handleAddPendingBooking = async (slotTime) => {
    if (!selectedChild || !clinicId || !selectedDate) {
      alert('يرجى اختيار الطفل والتاريخ أولاً.');
      return;
    }

    try {
      const appointmentTime = `${slotTime}:00`;

      const appointmentData = {
        child_id: selectedChild.child_id,
        appointment_day: selectedDate,
        appointment_time: appointmentTime,
        status: 'مجدولة',
        reason: 'طعم',
        clinic_id: clinicId,
        doctor_id: null, // هنا يجب تحديد الـ doctor_id المناسب
        parent_id: parentID
      };

      const response = await axios.post(
        `${ipAdd}:8888/APIS/pendingBookings`,
        appointmentData
      );

      if (response.status === 201) {
        const appointmentDate = new Date(`${selectedDate}T${slotTime}:00`);
        appointmentDate.setMinutes(appointmentDate.getMinutes() + 15); // إضافة 15 دقيقة
        const checkupTime = appointmentDate.toTimeString().slice(0, 5);

        const checkupAppointmentData = {
          child_id: selectedChild.child_id,
          appointment_day: selectedDate,
          appointment_time: `${checkupTime}:00`,
          status: 'مجدولة',
          reason: 'فحص',
          clinic_id: clinicId,
          doctor_id: null,
          parent_id: parentID
        };

        const checkupResponse = await axios.post(
          `${ipAdd}:8888/APIS/pendingBookings`,
          checkupAppointmentData
        );

        if (checkupResponse.status === 201) {
          alert('الوقت محجوز حالياً. إذا أصبح متاحاً، سنرسل للأم إشعاراً ، وفي حال تأكيدها للإشعار ، سننقل حجزها إذا بقي الموعد متاح.');
          fetchAppointments(clinicId, selectedDate);
        } else {
          throw new Error('حدث خطأ أثناء حجز موعد الفحص.');
        }
      } else {
        throw new Error('حدث خطأ أثناء حجز الموعد.');
      }
    } catch (err) {
      console.error('Error booking appointment:', err.message);
      alert('حدث خطأ أثناء حجز الموعد.');
    }
  };

  const renderTimeSlotsRow = (startIndex, endIndex) => (
    <FlatList
      horizontal
      data={timeSlots.slice(startIndex, endIndex)}
      keyExtractor={(item) => item.time}
      renderItem={({ item }) => {
        const isBooked = bookedSlots.includes(item.time); // تحقق من وجود الموعد في المواعيد المحجوزة
        return (
          <TouchableOpacity
            style={[
              styles.timeSlotButton,
              isBooked && styles.bookedTimeSlotButton // تطبيق لون الحجز فقط إذا كان الوقت محجوزاً
            ]}
            disabled={isBooked} // تعطيل الزر إذا كان محجوزاً
            onPress={() => {
              if (!selectedChild) {
                Alert.alert('تنبيه', 'يرجى اختيار الطفل أولاً.');
                return;
              }
              if (!isBooked) {
                handleBooking(item.time); // تنفيذ عملية الحجز
              }
            }}
          >
            <View style={styles.slotContainer}>
              {/* عرض الوقت */}
              <Text style={styles.timeSlotText}>{item.time}</Text>
              
              {/* عرض أيقونة الزائد إذا كان الموعد محجوزاً */}
              {isBooked && (
                <TouchableOpacity
                  style={styles.addIconContainer}
                  onPress={() => {
                    if (!selectedChild) {
                      alert('يرجى اختيار الطفل أولاً.');
                      return;
                    }
                    handleAddPendingBooking(item.time);
                  }}
                >
                  <Icon name="add-circle" size={20} color="black" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      
    />
  );
  

  return (
    <FlatList
      data={[1]} // Adding a single dummy element to enable FlatList usage
      keyExtractor={(item) => item.toString()}
      renderItem={() => (
        <View style={styles.container}>
          <Text style={styles.clinicIdText}>أدخل رقم هوية الأم</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل رقم الهوية "
            placeholderTextColor="#ccc" // تحديد اللون الرمادي

            value={motherId}
            onChangeText={setMotherId}
          />
<TouchableOpacity
  style={styles.submitButton}
  onPress={handleMotherIdSubmit}
>
  <Text style={styles.submitButtonText}>بحث</Text>
</TouchableOpacity>

          {loading && <Text style={styles.loadingText}>Loading...</Text>}

          <FlatList
            data={childrenList}
            keyExtractor={(item) => item.child_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
  onPress={() => setSelectedChild(item)}
  style={[styles.childItem, selectedChild === item && styles.childItemPressed]} // إضافة تأثير التمرير
>
  <Text style={styles.childText}>{item.name}</Text>
</TouchableOpacity>

            )}
          />


          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#4e54c8', selectedTextColor: 'white' }
            }}
            theme={{
              dayTextColor: 'black',
            arrowColor: '#4e54c8',
            todayTextColor: '#4e54c8',
            monthTextColor: '#4e54c8',
            textSectionTitleColor: '#4e54c8',
            selectedDayBackgroundColor: '#4e54c8',
            }}
          />

          <Text style={styles.slotTitle}>الأوقات</Text>
          {renderTimeSlotsRow(0, 12)}
          {renderTimeSlotsRow(12, 24)}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"#e6f0ff",

  },
  input: {
    height: 50, // زيادة الارتفاع لجعل الحقل أكثر راحة
    borderColor: '#4e54c8', // تغيير لون الحدود ليكون أزرق فاتح
    borderWidth: 1, // تحديد سمك الحدود
    borderRadius: 8, // الزوايا المستديرة
    marginBottom: 20, // المسافة السفلية بين العناصر
    paddingLeft: 12, // إضافة مسافة داخلية للمحتوى على اليسار
    backgroundColor: '#ffffff', // خلفية بيضاء نقية
    fontSize: 16, // حجم الخط داخل الـ input
    color: '#333', // لون النص داخل الحقل
    shadowColor: '#000', // اللون الأسود للظل
    shadowOffset: { width: 0, height: 2 }, // إزاحة الظل
    shadowOpacity: 0.1, // شفافية الظل
    shadowRadius: 5, // مدى الظل
    elevation: 3, // تأثير الظل للأجهزة التي تدعم ذلك
    textAlign:"right"
  },
  
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  clinicIdText: {
    marginBottom: 5,
    fontSize: 16,
    textAlign:"right"
  },
  childItem: {
    marginBottom: 10, // إضافة المسافة السفلية بين العناصر
    padding: 12, // إضافة مساحة حول المحتوى
    backgroundColor: '#f0f0f0', // خلفية مائلة للرمادي الفاتح
    borderRadius: 8, // الزوايا المستديرة
    borderWidth: 1, // الحدود الرقيقة حول العنصر
    borderColor: '#ddd', // لون الحدود
    shadowColor: '#000', // الظل الأسود
    shadowOffset: { width: 0, height: 2 }, // تحديد إزاحة الظل
    shadowOpacity: 0.1, // شفافية الظل
    shadowRadius: 4, // مدى الظل
    elevation: 5, // التأثير على الأجهزة التي تدعم الظل
  },
  childText: {
    fontSize: 16, // حجم الخط
    fontWeight: 'bold', // جعل الخط سميكًا
    color: '#333', // لون النص
    textAlign:"center"
  },

  datePickerTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  slotTitle: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
    marginTop:50,
    textAlign:"right",
    marginRight:8,

  },
  timeSlotButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#7494ec',
    marginBottom:20,
    borderRadius: 5,
    marginHorizontal: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: "center",
    position: 'relative',
    overflow: 'visible', // مهم لظهور الزر الفرعي

  },
  bookedTimeSlotButton: {
    backgroundColor: '#901421', // لون أحمر للزر المحجوز
  },
  selectedTimeSlotButton: {
    backgroundColor: '#901421',
  },
  timeSlotText: {
    color: '#fff',
    fontSize: 16,
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addIconContainer: {
    position: 'absolute',
    top: -18, // اضبط القيمة حسب الحاجة
    right: -18, // اضبط القيمة حسب الحاجة
    zIndex: 10, // اجعلها فوق العناصر الأخرى
    backgroundColor: 'white',
    borderRadius: 15, // اجعلها أكبر قليلاً لتظهر الدائرة كاملة

  },
  submitButton: {
    backgroundColor: '#7494ec', // اللون الأساسي للزر
    paddingVertical: 10, // المساحة العمودية داخل الزر
    paddingHorizontal: 5, // تقليل المساحة الأفقية لجعل الزر ضيقًا
    borderRadius: 5, // الزوايا المستديرة
    alignItems: 'center', // محاذاة النص في المنتصف
    marginVertical: 10, // المسافة العمودية بين العناصر
  },
  submitButtonText: {
    color: 'white', // لون النص
    fontSize: 16, // حجم النص
    fontWeight: 'bold', // سماكة النص
  },  
  childItemPressed: {
    backgroundColor: '#e0e0e0', // تغيير اللون عند التمرير
    borderColor: '#bbb', // تغيير لون الحدود عند التمرير
  },
});

export default ParentChildrenScreen;
