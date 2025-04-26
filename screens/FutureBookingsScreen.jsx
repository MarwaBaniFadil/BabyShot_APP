import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import { Alert } from 'react-native'; // استيراد مكتبة Alert

const App = () => {
  const [isChildrenListOpen, setIsChildrenListOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState({});
  const [isFutureAppointments, setIsFutureAppointments] = useState(true);

  useEffect(() => {
      const fetchChildren = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;
  
          const { id: parentId } = jwt_decode(token);
  
          const response = await axios.get(
            `${ipAdd}:8888/APIS/getChildrenByParentId/${parentId}`
          );
  
          setChildren(response.data.users || []);
        } catch (err) {
          setError('حدث خطأ أثناء تحميل البيانات.');
        } finally {
          setLoading(false);
        }
      };
  
      if (isChildrenListOpen) {
        fetchChildren();
      }
    }, [isChildrenListOpen]);
  
    const fetchAppointments = async (childId, isFuture) => {
      try {
        const endpoint = isFuture
          ? `${ipAdd}:8888/APIS/getFutureAppointmentsByChildId/${childId}`
          : `${ipAdd}:8888/APIS/getPastAppointmentsByChildId/${childId}`;
        const response = await axios.get(endpoint);
        setAppointments(response.data);
  
        const clinicPromises = response.data.map(async (appointment) => {
          const clinicId = appointment.clinic_id;
          if (!clinics[clinicId]) {
            const clinicResponse = await axios.get(
              `${ipAdd}:8888/APIS/getclinirenByid/${clinicId}`
            );
            clinics[clinicId] = clinicResponse.data.users[0].name;
          }
        });
  
        await Promise.all(clinicPromises);
        setClinics({ ...clinics });
      } catch (err) {
        setError('حدث خطأ أثناء تحميل المواعيد.');
      }
    };
  
    const toggleChildrenList = () => {
      setIsChildrenListOpen(!isChildrenListOpen);
    };
  
    const selectChild = (child) => {
      setSelectedChild(child);
      setIsChildrenListOpen(false);
      fetchAppointments(child.child_id, isFutureAppointments);
    };
  
    const toggleAppointmentType = (isFuture) => {
      setIsFutureAppointments(isFuture);
      if (selectedChild) {
        fetchAppointments(selectedChild.child_id, isFuture);
      }
    };
  
    const deleteAppointment = async (appointmentId) => {
      Alert.alert(
        'تأكيد الحذف', // عنوان النافذة
        'هل أنت متأكد أنك تريد حذف هذا الموعد؟', // الرسالة
        [
          {
            text: 'إلغاء', // زر الإلغاء
            style: 'cancel',
          },
          {
            text: 'نعم', // زر التأكيد
            onPress: async () => {
              try {
                await axios.delete(`${ipAdd}:8888/APIS/deleteSch/${appointmentId}`);
                setAppointments(appointments.filter(appointment => appointment.record_id !== appointmentId));
              } catch (err) {
                setError('حدث خطأ أثناء حذف الموعد.');
              }
            },
          },
        ],
        { cancelable: true } // يمكن للمستخدم إغلاق النافذة بالنقر خارجها
      );
    };
  
    const renderAppointment = ({ item }) => {
      const appointmentDate = new Date(item.appointment_day);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = item.appointment_time;
      const clinicName = clinics[item.clinic_id] || 'غير متوفر';
  
      return (
        <View style={styles.appointmentItem}>
          {/* إضافة الأيقونة إذا كانت المواعيد منتهية */}
          {item.status === 'مكتملة' && (
            <Image
              source={require('../images/correct.png')} // استبدل بمسار الأيقونة الصحيحة
              style={styles.checkIcon}
            />
          )}
  
          <View style={styles.appointmentHeader}>
            {/* عرض زر الحذف فقط إذا كان الموعد مستقبليًا */}
            {item.status === 'مجدولة' && (
              <TouchableOpacity
                onPress={() => deleteAppointment(item.record_id)}
                style={styles.deleteButton}
              >
                <Image
                  source={require('../images/remove.png')}
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            )}
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentTextBold}>التاريخ :  <Text style={styles.appointmentText}>{formattedDate}</Text></Text>
              <Text style={styles.appointmentTextBold}>الوقت :  <Text style={styles.appointmentText}>{formattedTime}</Text></Text>
              <Text style={styles.appointmentTextBold}>العيادة :  <Text style={styles.appointmentText}>{clinicName}</Text></Text>
              <Text style={styles.appointmentTextBold}>السبب :  <Text style={styles.appointmentText}>{item.reason}</Text></Text>
              <Text style={styles.appointmentTextBold}>الحالة :  <Text style={styles.appointmentText}>{item.status}</Text></Text>
            </View>
          </View>
        </View>
      );
    };
  
    const renderChild = ({ item }) => (
      <View style={styles.childItem}>
        <TouchableOpacity style={styles.childButton} onPress={() => selectChild(item)}>
          <Text style={styles.childName}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleChildrenList} style={styles.header}>
          <Text style={styles.headerText}>
            {selectedChild ? selectedChild.name : 'الأطفال'}
          </Text>
          <Image
            style={[styles.arrow, { transform: [{ rotate: isChildrenListOpen ? '180deg' : '0deg' }] }]}
            source={require('../images/down.png')}
          />
        </TouchableOpacity>
  
        {isChildrenListOpen ? (
          loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : children.length > 0 ? (
            <FlatList
              data={children}
              renderItem={renderChild}
              keyExtractor={(item) => item.child_id.toString()}
              style={styles.childrenList}
            />
          ) : (
            <Text style={styles.noChildrenText}>لا يوجد أطفال متوفرين.</Text>
          )
        ) : null}
  
        {selectedChild && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => toggleAppointmentType(true)}
              style={[styles.button, isFutureAppointments ? styles.activeButton : null]}
            >
              <Text style={styles.buttonText}>المواعيد المستقبلية</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleAppointmentType(false)}
              style={[styles.button, !isFutureAppointments ? styles.activeButton : null]}
            >
              <Text style={styles.buttonText}>المواعيد المنتهية</Text>
            </TouchableOpacity>
          </View>
        )}
  
        {appointments.length > 0 && (
          <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.record_id.toString()}
            style={styles.appointmentsList}
          />
        )}
      </View>
    );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"#e6f0ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row-reverse', // عكس ترتيب العناصر
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#7494ec',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
  },
  arrow: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  childButton: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 2,
    width: '100%',
  },
  childName: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#4e54c8',
    width: '48%',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#7494ec',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  appointmentsList: {
    marginTop: 20,
  },
  appointmentItem: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // الآن الكتابة تكون على اليمين
  },
  deleteButton: {
    marginLeft: 0, // جعل زر الحذف في الجهة اليسرى
  },
  deleteIcon: {
    width: 30,
    height: 30,
  },
  appointmentInfo: {
    flex: 1,
    alignItems: 'flex-end', // جعل الكتابة في الجهة اليمنى
  },
  appointmentTextBold: {
    fontWeight: 'bold',
    fontSize:15,
    color:"#4e54c8"
  },
  appointmentText: {
    fontSize: 14,
    color:"black",
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noChildrenText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
  },
});

export default App;
