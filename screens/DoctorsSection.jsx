import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import ipAdd from "C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress";
import Icon from 'react-native-vector-icons/MaterialIcons'; 


const RadioButton = ({ label, value, selectedValue, onValueChange }) => (
  <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onValueChange(value)}>
    <View style={[styles.radioButton, selectedValue === value && styles.radioButtonSelected]} />
    <Text>{label}</Text>
  </TouchableOpacity>
);

const DoctorScreen = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorId1, setDoctorId1] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorName1, setDoctorName1] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorPhone1, setDoctorPhone1] = useState('');
  const [specialization, setSpecialization] = useState(''); 
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteDoctorId, setDeleteDoctorId] = useState('');  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null); 
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');


  const openEmailModal = async (doctor_id) => {
    try {
      console.log(`طلب الإيميل للطبيب مع رقم الهوية: ${doctor_id}`);
      // إرسال طلب API للحصول على الإيميل بناءً على رقم هوية الطبيب
      const response = await axios.get(`${ipAdd}:8888/APIS/getEmailByDoctorId/${doctor_id}`);
      console.log(response.data);

      // إذا كان الرد يحتوي على الإيميل
      if (response.status===200) {
        setDoctorEmail(response.data.email);  // تعيين الإيميل الذي تم استرجاعه
        setEmailModalVisible(true);           // فتح نافذة التعديل
      } else {
        Alert.alert('خطأ', 'لم يتم العثور على الإيميل.');
      }
    } catch (error) {
      console.error('حدث خطأ أثناء الحصول على الإيميل:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الاتصال بالسيرفر.');
    }
  };
  



  const fetchDoctors = async (type) => {
    setLoading(true);
    setError('');
    setDoctors([]);
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('التوكين غير موجود.');
        return;
      }

      const decodedToken = jwtDecode(token);
      const roleMsg = decodedToken.roleMessage || '';
      const clinic = roleMsg
        .split(' ')
        .slice(roleMsg.split(' ').indexOf('ادمن') + 1)
        .join(' ')
        .trim();

      //setClinicName(clinic);
      console.log(clinic);
      // استدعاء API للحصول على رقم العيادة بناءً على اسمها
      const clinicApiUrl = `${ipAdd}:8888/APIS/clinic/${encodeURIComponent(clinic)}`;
      const clinicResponse = await axios.get(clinicApiUrl);
  
      // التحقق من نجاح الطلب والحصول على رقم العيادة
      const clinicId = clinicResponse.data.clinic_id; 
      if (!clinicId) {
        throw new Error('لم يتم العثور على رقم العيادة.');
      }
  
      // تحديد URL واجهة API بناءً على نوع الأطباء
      const apiUrl =
        type === 'vaccination'
          ? `${ipAdd}:8888/APIS/vaccination-doctors/${clinicId}`
          : `${ipAdd}:8888/APIS/examination-doctors/${clinicId}`;
  
      // استدعاء API لجلب بيانات الأطباء
      const doctorsResponse = await axios.get(apiUrl);
      setDoctors(doctorsResponse.data.doctors);
  
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات.');
    } finally {
      setLoading(false);
    }
  };
  
  const openEditModal = (doctor) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      setDoctorId(doctor.doctor_id ? doctor.doctor_id.toString() : ''); // تأكد من وجود قيمة
      console.log(doctorId);
      setDoctorName(doctor.name || ''); 
      setDoctorPhone(doctor.contact_number || '');
      setEditModalVisible(true);
    } else {
      Alert.alert('خطأ', 'لا توجد بيانات دكتور صالحة');
    }
  };
  
 
const saveDoctorEdits = async () => {
  if (!doctorId || !doctorName || !doctorPhone) {
    Alert.alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const apiUrl = `${ipAdd}:8888/APIS/updateDoctorNew/${selectedDoctor.doctor_id}`;
    const updatedDoctorData = {
      new_doctor_id: doctorId,
      name: doctorName,
      contact_number: doctorPhone,
    };

    const response = await axios.put(apiUrl, updatedDoctorData);

    if (response.status === 200 && response.data.message==="تم تعديل بيانات الدكتور بنجاح.") {
      Alert.alert('تم التعديل بنجاح!');
      setEditModalVisible(false);
      fetchDoctors('vaccination'); 
    }
    else if (response.status === 200 && response.data.message==="يرجى ملء جميع الحقول المطلوبة."){
      Alert.alert('أدخل البيانات كاملة من فضلك!');

    } else if (response.status === 200 && response.data.message==="رقم الهوية الجديد موجود بالفعل. يرجى اختيار رقم آخر."){
      Alert.alert('رقم الهوية هذا لطبيب اخر');

    }else {
      Alert.alert('فشل في تعديل بيانات الدكتور.');
    }
  } catch (error) {
    console.error('خطأ أثناء تعديل الدكتور:', error);
    Alert.alert('حدث خطأ أثناء تعديل الدكتور.');
  }
};
const handlePasswordReset = async () => {
  if (!email) {
    Alert.alert('خطأ', 'يرجى إدخال الإيميل.');
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(`${ipAdd}:8888/APIS/generate-password`, {
      email,
    });
console.log(email);
    if (response.data.plainPassword) {
      Alert.alert(
        'تم التغيير بنجاح',
        `كلمة السر الجديدة هي: ${response.data.plainPassword}`
      );
      setPassModalVisible(false);
      setEmail('');
    } else {
      Alert.alert('خطأ', response.data.message || 'حدث خطأ أثناء معالجة الطلب.');
    }
  } catch (error) {
    Alert.alert('خطأ', 'حدث خطأ أثناء الاتصال بالسيرفر.');
  } finally {
    setLoading(false);
  }
};


  const handleAddDoctor = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('التوكين غير موجود.');
        return;
      }

      const decodedToken = jwtDecode(token);
      const roleMsg = decodedToken.roleMessage || '';
      const clinic = roleMsg
        .split(' ')
        .slice(roleMsg.split(' ').indexOf('ادمن') + 1)
        .join(' ')
        .trim();

      setClinicName(clinic);
      setModalVisible(true);
    } catch (error) {
      console.error('خطأ أثناء فك تشفير التوكين:', error);
      setError('حدث خطأ أثناء معالجة التوكين.');
    }
  };

  const saveDoctor = async () => {
    if (!doctorId1 || !doctorName1 || !doctorPhone1 || !specialization) {
      Alert.alert('يرجى ملء جميع الحقول.');
      return;
    }

    try {
      const apiUrl = `${ipAdd}:8888/APIS/addDoctor`;

      const decodedToken = jwtDecode(await AsyncStorage.getItem('token'));
      const roleMsg = decodedToken.roleMessage || '';
      const clinic = roleMsg.split(' ').slice(roleMsg.split(' ').indexOf('ادمن') + 1).join(' ').trim();

      const doctorData = {
        doctor_id: doctorId1,
        doctor_name: doctorName1,
        specialization: specialization,
        clinic_name: clinic,
        contact_number: doctorPhone1,
      };

      const response = await axios.post(apiUrl, doctorData);

      if (response.status === 200 && response.data.message === "تم إضافة الدكتور بنجاح إلى الكلينيك ستاف") {
        const {plainPassword } = response.data;

        // عرض الرسالة مع الإيميل وكلمة السر
        Alert.alert(
          'تمت الإضافة بنجاح',
          `كلمة السر هي : ${plainPassword}`
        );
        setError('');
        setModalVisible(false);
        setDoctorId1('');
        setDoctorName1('');
        setDoctorPhone1('');
        setSpecialization('');
        if (specialization==="دكتور طعومات"){
                  fetchDoctors('vaccination');

        }
        else {
                  fetchDoctors('examination');

        }
      } 
      else if (response.status === 200 && response.data.message ==="الدكتور موجود بالفعل"){
        Alert.alert("الدكتور موجود بالفعل");

      }else {
        Alert.alert('فشل في إضافة الدكتور. تحقق من البيانات المدخلة.');
      }
    } catch (error) {
      console.error('خطأ أثناء إرسال طلب POST:', error);
      setError('حدث خطأ أثناء إضافة الدكتور.');
    }
  };
  const handleDeleteDoctor = async () => {
    if (!deleteDoctorId) {
      Alert.alert("يرجى إدخال رقم هوية الدكتور");

      return;
    }
    try {
      const apiUrl = `${ipAdd}:8888/APIS/deleteDoctor/${deleteDoctorId}`;
      const response = await axios.delete(apiUrl);
      if (response.status === 200 && response.data.message==='تم حذف الدكتور بنجاح من جميع الجداول') {
        Alert.alert("تم حذف الدكتور بنجاح");
        setError('');
        setDeleteModalVisible(false);
        setDeleteDoctorId('');
       // fetchDoctors('vaccination'); 
       // fetchDoctors('examination'); 
      } 
      else if (response.status === 200 && response.data.message==="الدكتور غير موجود"){
        Alert.alert("الدكتور غير موجود.");

      }else {
        setError('فشل في حذف الدكتور.');
      }
    } catch (error) {
      setError('حدث خطأ أثناء حذف الدكتور.');
    }
  };

  const renderDoctor = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.editColumn}>
        <TouchableOpacity style={styles.editButton1} onPress={() => openEditModal(item)}>
<Icon name="edit" size={20} color="#7494ec" />
</TouchableOpacity>
      </View>
        {/* إضافة أيقونة لفتح نافذة الإيميل */}
        <TouchableOpacity onPress={() => openEmailModal(item.doctor_id)}>
        <Icon name="email" size={20} color="#7494ec" />
      </TouchableOpacity>
  
      {/* الأعمدة الأخرى لعرض البيانات */}
      <Text style={styles.cell}>{item.contact_number}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.doctor_id}</Text>
      
    </View>
  );
  

  return (
    <View style={styles.container}>
    
      <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
          style={[styles.button,styles.del]}
          onPress={() => setPassModalVisible(true)}
        > 
          <Text style={styles.buttonText}>كلمة سر جديدة</Text>
        </TouchableOpacity>
      <TouchableOpacity
          style={[styles.button, styles.closeButton,styles.del]}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Icon name="delete" size={24} color="white" /> 
          <Text style={styles.buttonText}>حذف دكتور</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button,styles.del]}
          onPress={handleAddDoctor}
        >
          <Icon name="add" size={24} color="white" /> 
          <Text style={styles.buttonText}>إضافة دكتور</Text>
        </TouchableOpacity>
       
       
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => fetchDoctors('vaccination')}
        >
          <Text style={styles.buttonText}>عرض دكاترة التطعيم</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => fetchDoctors('examination')}
        >
          <Text style={styles.buttonText}>عرض دكاترة الفحص</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.table}>
        <View style={styles.row}>
        <Text style={[styles.cell, styles.headerCell,styles.tableHeaderText]}></Text>
          <Text style={[styles.cell, styles.headerCell,styles.tableHeaderText]}>رقم الهاتف</Text>
          <Text style={[styles.cell, styles.headerCell,styles.tableHeaderText]}>الاسم</Text>
          <Text style={[styles.cell, styles.headerCell,styles.tableHeaderText]}>رقم الهوية</Text>
        </View>
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.doctor_id.toString()}
          renderItem={renderDoctor}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة دكتور</Text>
            
            <Text style={styles.label}>رقم الهوية</Text>
            <TextInput
              style={styles.input}
              placeholder="رقم الهوية"
              value={doctorId1}
              onChangeText={setDoctorId1}
            />

            <Text style={styles.label}>الاسم</Text>
            <TextInput
              style={styles.input}
              placeholder="الاسم"
              value={doctorName1}
              onChangeText={setDoctorName1}
            />

            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              placeholder="رقم الهاتف"
              value={doctorPhone1}
              onChangeText={setDoctorPhone1}
            />

            <Text style={styles.label}> التخصص:</Text>
            <RadioButton
              label="تطعيم"
              value="دكتور طعومات"
              selectedValue={specialization}
              onValueChange={setSpecialization}
            />
            <RadioButton
              label=" فحص"
              value="دكتور فحوصات"
              selectedValue={specialization}
              onValueChange={setSpecialization}
            />
<View style={styles.buttonContainer1}>
<TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveDoctor}
            >
              <Text style={styles.buttonText}>حفظ</Text>
            </TouchableOpacity>
           
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>حذف دكتور</Text>
            <Text style={styles.label} >أدخل رقم الهوية:</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل رقم هوية الدكتور"
              value={deleteDoctorId}
              onChangeText={setDeleteDoctorId}
            />
            <View style={styles.buttonContainer1}>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleDeleteDoctor}
            >
              <Text style={styles.buttonText}>حذف</Text>
            </TouchableOpacity>
            
            </View>

          </View>
        </View>
      </Modal>
      
<Modal
  animationType="slide"
  transparent={true}
  visible={editModalVisible}
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>تعديل بيانات الدكتور</Text>

      <Text style={styles.label}>أدخل رقم الهوية الجديد:</Text>
      <TextInput
        style={styles.input}
        placeholder="رقم الهوية"
        value={doctorId}
        onChangeText={setDoctorId}
      />

      <Text style={styles.label}>أدخل الاسم الجديد:</Text>
      <TextInput
        style={styles.input}
        placeholder="الاسم"
        value={doctorName}
        onChangeText={setDoctorName}
      />

      <Text style={styles.label}>أدخل رقم الهاتف الجديد:</Text>
      <TextInput
        style={styles.input}
        placeholder="رقم الهاتف"
        value={doctorPhone}
        onChangeText={setDoctorPhone}
      />
<View style={styles.buttonContainer1}>
<TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setEditModalVisible(false)}>
        <Text style={styles.buttonText}>إغلاق</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveDoctorEdits}>
        <Text style={styles.buttonText}>تعديل</Text>
      </TouchableOpacity>
      
      </View>

    </View>
  </View>
</Modal>
<Modal
        animationType="slide"
        transparent={true}
        visible={passModalVisible}
        onRequestClose={() => setPassModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إنشاء كلمة سر جديدة</Text>

            {/* إدخال الإيميل */}
            <TextInput
              style={styles.input}
              placeholder="أدخل الإيميل"
              placeholderTextColor="#888"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
<View style={styles.buttonContainer1}>

            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setPassModalVisible(false)}
            >
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handlePasswordReset}
              disabled={loading}
            >
               <Text style={styles.buttonText}>تغيير</Text>
            </TouchableOpacity>

            
            </View>

          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={emailModalVisible}
        animationType="slide"
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>الإيميل</Text>
            <Text style={styles.bold}>{doctorEmail}</Text>
            <TouchableOpacity onPress={() => setEmailModalVisible(false)} style={[styles.button, styles.closeButton]}>
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e6f0ff",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: "center",
    marginBottom: 30,
    
  },
  button: {
    backgroundColor: "#7494ec",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    //alignContent:"flex-end",
    alignSelf: "flex-end",
    marginLeft: 3,
    marginRight:3,
  },
  actionButton: {
    backgroundColor: '#28a745',
  },
  saveButton: {
    backgroundColor: '#7494ec',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
    backgroundColor:"white",
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center', // لضبط محاذاة العناصر عموديًا
  },
  cell: {
    padding: 10,
    flex: 1,
    textAlign: 'center',
  },
  editColumn: {
    flex: 0.5, // تعيين عرض العمود الخاص بالزر
    justifyContent: 'center',
    alignItems: 'center', // محاذاة الزر في المنتصف
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  headerCell: {
    flexDirection: "row",
    backgroundColor: "#7494ec",
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color:"#4e54c8",
    textAlign:"center"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    textAlign:"right",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign:"right"
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop:10,
    justifyContent:"flex-end",

 },
  
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7494ec',
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#4e54c8',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
  },
  editButton1: {
    backgroundColor: 'white', // لون أصفر جذاب
    paddingVertical: 8, // مساحة عمودية داخل الزر
    paddingHorizontal: 8, // مساحة أفقية داخل الزر
    borderRadius: 5, // زوايا مستديرة
    alignItems: 'center', // توسيط النص داخل الزر
    justifyContent: 'center', // توسيط النص عموديًا داخل الزر
    margin: 5, // مسافة بين الأزرار
  },
  tableHeaderText: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer1: {
    flexDirection: 'row', // لضبط الأزرار بجانب بعض
    justifyContent: 'space-between',
    marginTop: 5,
  },
  deleteButton: {
    backgroundcolor:"red",
  },
  bold: {
    fontWeight:"bold",
    textAlign:"center",
  },
  del:{
    flexDirection: 'row', // لضبط الأزرار بجانب بعض
  },
 

});

export default DoctorScreen;
