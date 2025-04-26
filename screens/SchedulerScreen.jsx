import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { Calendar } from 'react-native-calendars';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChildrenListOpen, setIsChildrenListOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [children, setChildren] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  // جلب العيادات
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await axios.get(`${ipAdd}:8888/APIS/clinics`);
        setClinics(response.data.clinics || []);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل العيادات.');
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinics();
  }, []);

  // جلب الأطفال بناءً على التوكين
  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('تعذر العثور على التوكين.');

      const decodedToken = jwtDecode(token);
      const parentId = decodedToken?.id;

      if (!parentId) throw new Error('تعذر تحديد Parent ID.');

      const response = await axios.get(`${ipAdd}:8888/APIS/getChildrenByParentId/${parentId}`);
      setChildren(response.data.users || []);
    } catch (err) {
      console.error('Error fetching children:', err.message);
      setError('حدث خطأ أثناء تحميل الأطفال.');
    } finally {
      setLoadingChildren(false);
    }
  };

  // جلب المواعيد المحجوزة
  const fetchAppointments = async (clinicId, date) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/appointments/${date}/${clinicId}`);
      // استخدام البيانات مباشرة بما أن API يرجع مصفوفة
      const bookedTimes = response.data.map((appointment) =>
        appointment.appointment_time.slice(0, 5) // تحويل "HH:mm:ss" إلى "HH:mm"
      );
      setBookedSlots(bookedTimes || []);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
      setBookedSlots([]);
    }
  };
  

  // فتح قائمة الأطفال
  const toggleChildrenList = () => {
    setIsChildrenListOpen(!isChildrenListOpen);
    if (!isChildrenListOpen) fetchChildren();
  };

  // فتح قائمة العيادات
  const toggleClinicList = () => {
    setIsOpen(!isOpen);
  };

  const fetchVaccineDoctor = async (clinicId) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/getdoctorsByclinic1/${clinicId}`);
      console.log('Vaccine Doctor:', response.data || []);
    } catch (err) {
      console.error('Error fetching vaccine doctor:', err.message);
    }
  };
  
  // جلب معلومات دكتور الفحص
  const fetchCheckupDoctor = async (clinicId) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/getdoctorsByclinic2/${clinicId}`);
      console.log('Checkup Doctor:', response.data || []);
    } catch (err) {
      console.error('Error fetching checkup doctor:', err.message);
    }
  };

  // اختيار العيادة
  const selectClinic = (clinic) => {
    setSelectedClinic(clinic);
    setIsOpen(false);
    setSelectedChild(null);
    setBookedSlots([]);
    if (selectedDate) fetchAppointments(clinic.clinic_id, selectedDate);
     // استدعاء API لجلب معلومات دكتور الطعم
  fetchVaccineDoctor(clinic.clinic_id);

  // استدعاء API لجلب معلومات دكتور الفحص
  fetchCheckupDoctor(clinic.clinic_id);
  };

  // اختيار الطفل
  const selectChild = (child) => {
    setSelectedChild(child);
    setIsChildrenListOpen(false);
  };

  // اختيار التاريخ
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    if (selectedClinic) fetchAppointments(selectedClinic.clinic_id, date.dateString);
  };
// حجز موعد عند الضغط على زر
const handleBooking = async (slotTime) => {
  if (!selectedChild || !selectedClinic || !selectedDate) {
    alert('يرجى اختيار الطفل والعيادة والتاريخ أولاً.');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('تعذر العثور على التوكين.');

    // فك التوكين واستخراج parent_id
    const decodedToken = jwtDecode(token);
    const parentId = decodedToken?.id;

    if (!parentId) throw new Error('تعذر تحديد Parent ID.');

    // تنسيق الوقت ليحتوي على ثواني
    const appointmentTime = `${slotTime}:00`;

    // جلب doctor_id الخاص بالطعم
    const doctorResponse = await axios.get(
      `${ipAdd}:8888/APIS/getdoctorsByclinic1/${selectedClinic.clinic_id}`
    );
    const vaccineDoctorId = doctorResponse.data[0]?.doctor_id;

    if (!vaccineDoctorId) throw new Error('تعذر العثور على Doctor ID للطعم.');

    // بيانات حجز الطعم
    const appointmentData = {
      child_id: selectedChild.child_id, // ID الطفل
      appointment_day: selectedDate,    // يوم الموعد (yyyy-MM-dd)
      appointment_time: appointmentTime, // وقت الموعد (HH:mm:ss)
      status: 'مجدولة',                // حالة الموعد
      reason: 'طعم',                   // سبب الموعد
      clinic_id: selectedClinic.clinic_id, // ID العيادة
      doctor_id: null,         // ID دكتور الطعم
      parent_id: parentId                // ID الأب
    };

    // إرسال الحجز للطعم
    const response = await axios.post(
      `${ipAdd}:8888/APIS/book-appointment`,
      appointmentData
    );

    if (response.status === 201) {
      // حساب وقت الفحص (إضافة 15 دقيقة)
      const appointmentDate = new Date(`${selectedDate}T${slotTime}:00`);
      appointmentDate.setMinutes(appointmentDate.getMinutes() + 15); // إضافة 15 دقيقة
      const checkupTime = appointmentDate.toTimeString().slice(0, 5); // الحصول على الوقت الجديد بصيغة HH:mm

      // الآن نحتفظ بـ doctor_id الخاص بالفحص
      const checkupDoctorResponse = await axios.get(
        `${ipAdd}:8888/APIS/getdoctorsByclinic2/${selectedClinic.clinic_id}`
      );
      const checkupDoctorId = checkupDoctorResponse.data[0]?.doctor_id;

      if (!checkupDoctorId) throw new Error('تعذر العثور على Doctor ID للفحص.');

      // بيانات حجز الفحص
      const checkupAppointmentData = {
        child_id: selectedChild.child_id, // ID الطفل
        appointment_day: selectedDate,    // يوم الموعد
        appointment_time: `${checkupTime}:00`, // وقت الموعد بعد 15 دقيقة
        status: 'مجدولة',                // حالة الموعد
        reason: 'فحص',                   // سبب الموعد
        clinic_id: selectedClinic.clinic_id, // ID العيادة
        doctor_id: null,         // ID دكتور الفحص
        parent_id: parentId                // ID الأب
      };

      // إرسال الحجز للفحص
      const checkupResponse = await axios.post(
        `${ipAdd}:8888/APIS/book-appointment`,
        checkupAppointmentData
      );

      if (checkupResponse.status === 201) {
        const successMessage = `تم تثبيت حجزك في الساعة ${appointmentTime} للطعم وراجع طبيب الأطفال في الساعة ${checkupTime} للفحص.`;
        alert(successMessage);
        fetchAppointments(selectedClinic.clinic_id, selectedDate);
      } else {
        throw new Error('حدث خطأ أثناء حجز موعد الفحص.');
      }
    } else {
      throw new Error('حدث خطأ أثناء حجز موعد الطعم.');
    }
  } catch (err) {
    console.error('Error booking appointment:', err.message);
    alert('حدث خطأ أثناء حجز الموعد.');
  }
};
// زر زائد (أثناء الضغط عليه)
// زر زائد (أثناء الضغط عليه)
const handleAddPendingBooking = async (slotTime) => {
  if (!selectedChild || !selectedClinic || !selectedDate) {
    alert('يرجى اختيار الطفل والعيادة والتاريخ أولاً.');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('تعذر العثور على التوكين.');

    // فك التوكين واستخراج parent_id
    const decodedToken = jwtDecode(token);
    const parentId = decodedToken?.id;

    if (!parentId) throw new Error('تعذر تحديد Parent ID.');

    // تنسيق الوقت ليحتوي على ثواني
    const appointmentTime = `${slotTime}:00`;

    // جلب doctor_id الخاص بالطعم
    const doctorResponse = await axios.get(
      `${ipAdd}:8888/APIS/getdoctorsByclinic1/${selectedClinic.clinic_id}`
    );
    const vaccineDoctorId = doctorResponse.data[0]?.doctor_id;

    if (!vaccineDoctorId) throw new Error('تعذر العثور على Doctor ID للطعم.');

    // بيانات حجز الطعم
    const appointmentData = {
      child_id: selectedChild.child_id, // ID الطفل
      appointment_day: selectedDate,    // يوم الموعد (yyyy-MM-dd)
      appointment_time: appointmentTime, // وقت الموعد (HH:mm:ss)
      status: 'مجدولة',                // حالة الموعد
      reason: 'طعم',                   // سبب الموعد
      clinic_id: selectedClinic.clinic_id, // ID العيادة
      doctor_id: null,         // ID دكتور الطعم
      parent_id: parentId                // ID الأب
    };

    // إرسال الحجز للطعم إلى API الجديد (pendingBookings)
    const pendingBookingResponse = await axios.post(
      `${ipAdd}:8888/APIS/pendingBookings`,
      appointmentData
    );

    if (pendingBookingResponse.status === 201) {
      console.log('حجز الطعم تم بنجاح في pendingBookings.');

      // الآن نحتفظ بـ doctor_id الخاص بالفحص
      const checkupDoctorResponse = await axios.get(
        `${ipAdd}:8888/APIS/getdoctorsByclinic2/${selectedClinic.clinic_id}`
      );
      const checkupDoctorId = checkupDoctorResponse.data[0]?.doctor_id;

      if (!checkupDoctorId) throw new Error('تعذر العثور على Doctor ID للفحص.');

      // حساب الوقت الجديد بعد 15 دقيقة
      const appointmentTimeObj = new Date(`1970-01-01T${slotTime}:00Z`); // استخدام تاريخ ثابت لأننا نحتاج فقط للوقت
      appointmentTimeObj.setMinutes(appointmentTimeObj.getMinutes() + 15); // إضافة 15 دقيقة

      // تنسيق الوقت الجديد بعد إضافة 15 دقيقة
      const checkupTime = appointmentTimeObj.toISOString().substr(11, 5); // استخراج الوقت بتنسيق HH:mm

      // بيانات حجز الفحص
      const checkupAppointmentData = {
        child_id: selectedChild.child_id, // ID الطفل
        appointment_day: selectedDate,    // يوم الموعد
        appointment_time: `${checkupTime}:00`, // وقت الموعد للطعم + 15 دقيقة
        status: 'مجدولة',                // حالة الموعد
        reason: 'فحص',                   // سبب الموعد
        clinic_id: selectedClinic.clinic_id, // ID العيادة
        doctor_id: null,         // ID دكتور الفحص
        parent_id: parentId                // ID الأب
      };

      // إرسال حجز الفحص إلى API الجديد (pendingBookings)
      const pendingCheckupResponse = await axios.post(
        `${ipAdd}:8888/APIS/pendingBookings`,
        checkupAppointmentData
      );

      if (pendingCheckupResponse.status === 201) {
        console.log('حجز الفحص تم بنجاح في pendingBookings.');
        alert('الوقت محجوز حالياً. إذا أصبح متاحاً، سنرسل لك إشعاراً ، وفي حال تأكيدك للإشعار ، سننقل حجزك إذا بقي الموعد متاح.');
      } else {
        throw new Error('حدث خطأ أثناء إرسال حجز الفحص إلى pendingBookings.');
      }
    } else {
      throw new Error('حدث خطأ أثناء إرسال حجز الطعم إلى pendingBookings.');
    }
  } catch (err) {
    console.error('Error sending pending booking:', err.message);
    alert('حدث خطأ أثناء إرسال الحجز.');
  }
};


  const currentDate = new Date().toISOString().split('T')[0];

  // المواعيد من الساعة 8:00 صباحًا إلى الساعة 1:00 ظهرًا
  const timeSlots = [
    { time: '08:00' }, { time: '08:15' }, { time: '08:30' }, { time: '08:45' },
    { time: '09:00' }, { time: '09:15' }, { time: '09:30' }, { time: '09:45' },
    { time: '10:00' }, { time: '10:15' }, { time: '10:30' }, { time: '10:45' },
    { time: '11:00' }, { time: '11:15' }, { time: '11:30' }, { time: '11:45' },
    { time: '12:00' }, { time: '12:15' }, { time: '12:30' }, { time: '12:45' },
    { time: '13:00' }, { time: '13:15' }, { time: '13:30' }, { time: '13:45' }
  ];

  return (
    <View style={styles.container}>
      {/* قائمة العيادات */}
      <View style={styles.box}>
        <TouchableOpacity onPress={toggleClinicList} style={styles.header}>
          <Text style={styles.headerText}>
            {selectedClinic ? selectedClinic.name : 'اختر عيادة'}
          </Text>
          <Image
            style={[styles.arrow, { transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }]}
            source={require('../images/down.png')}
          />
        </TouchableOpacity>
        {isOpen && (
          <FlatList
            data={clinics}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => selectClinic(item)}
              >
                <Text style={styles.childName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>

      {/* قائمة الأطفال */}
      <View style={styles.box}>
        <TouchableOpacity onPress={toggleChildrenList} style={styles.header}>
          <Text style={styles.headerText}>
            {selectedChild ? selectedChild.name : 'اختر طفلاً'}
          </Text>
          <Image
            style={[styles.arrow, { transform: [{ rotate: isChildrenListOpen ? '180deg' : '0deg' }] }]}
            source={require('../images/down.png')}
          />
        </TouchableOpacity>
        {isChildrenListOpen ? (
          loadingChildren ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : children.length > 0 ? (
            <FlatList
              data={children}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => selectChild(item)}>
                  <Text style={styles.childName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.child_id.toString()}
            />
          ) : (
            <Text>لا يوجد أطفال متوفرين.</Text>
          )
        ) : null}
      </View>

      {/* اختيار التاريخ */}
      <View style={styles.box}>
        <Calendar
          minDate={currentDate}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#4e54c8', selectedTextColor: 'white' }
          }}
          onDayPress={handleDateSelect}
          theme={{
            dayTextColor: 'black',
            arrowColor: '#4e54c8',
            todayTextColor: '#4e54c8',
            monthTextColor: '#4e54c8',
            textSectionTitleColor: '#4e54c8',
            selectedDayBackgroundColor: '#4e54c8',
            
          }}
        />
      </View>

      
      
      <ScrollView style={styles.timeSlotsContainer}>
  {/* صف المواعيد الصباحية */}
  <Text style={styles.timeSlotGroupTitle}>صباحاً</Text>
  <FlatList style={styles.timeSlotbox}
  data={timeSlots.slice(0, 12)} // مثال للفترة الصباحية
  horizontal
  renderItem={({ item }) => {
    const isBooked = bookedSlots.includes(item.time);
    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          isBooked && { backgroundColor: '#901421' },
        ]}
        disabled={isBooked}
        onPress={() => handleBooking(item.time)}
      >
        <Text style={styles.timeText}>{item.time}</Text>
        {isBooked && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddPendingBooking(item.time)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }}
  keyExtractor={(item) => item.time}
/>


  {/* صف المواعيد الظهيرة */}
  <Text style={styles.timeSlotGroupTitle}>ظهراً</Text>
  <FlatList style={styles.timeSlotbox}
    data={timeSlots.slice(12)} // المواعيد من 12 فصاعدًا
    horizontal
    renderItem={({ item }) => {
      const isBooked = bookedSlots.includes(item.time);
      return (
        <TouchableOpacity
          style={[
            styles.timeSlot,
            isBooked && { backgroundColor: '#901421' },
          ]}
          disabled={isBooked}
          onPress={() => handleBooking(item.time)}
        >
          <Text style={styles.timeText}>{item.time}</Text>
          {isBooked && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddPendingBooking(item.time)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    }}
    keyExtractor={(item) => item.time}
  />
</ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"#e6f0ff",
  },
  header: {
    flexDirection: 'row-reverse', // عكس ترتيب العناصر
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#7494ec',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom:10,
    },
  headerText: {
    fontSize: 18,
    color: '#fff',
  },
  arrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  item: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 2,
    width: '100%',
  },
  timeSlotsContainer: {
    marginVertical: 10,
  },
  timeSlotGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e54c8',
    marginVertical: 10,
    textAlign: 'left',
    marginBottom:10,
  },
  timeSlot: {
    backgroundColor: '#7494ec',
    borderRadius: 5,
    marginHorizontal: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: "center",
    position: 'relative',
    overflow: 'visible', // مهم لظهور الزر الفرعي
  },
  timeText: {
    color: 'white',
    fontSize: 16,
  },
 addButton: {
  position: 'absolute',
  top: -8,  // بدّل هذه القيمة حسب الحاجة
  right: -8, // بدّل هذه القيمة حسب الحاجة
  backgroundColor: 'white',
  borderRadius: 15, // اجعلها أكبر قليلاً لتظهر الدائرة كاملة
  paddingHorizontal: 5, // زِد هذه القيمة لتحسين حجم الزر
  paddingVertical: 2,
  zIndex: 10,
  elevation: 3, // لإضافة ظل خفيف على Android
},
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  box: {
    marginBottom: 10,
  },
  
  childName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  timeSlotbox:{
    paddingTop:8,
    marginBottom:5,
  },
  
});

export default App;
