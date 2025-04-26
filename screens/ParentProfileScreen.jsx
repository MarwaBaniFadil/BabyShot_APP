import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient'; 
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import Modal from 'react-native-modal';  // استيراد مكتبة modal
import { TextInput } from 'react-native'; // إضافة هذا السطر


export default function UserProfile() {
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [parentId, setParentId] = useState('');
  const [parentData, setParentData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);  // حالة لتحديد ما إذا كان المودال مرئيا
  const [modalText, setModalText] = useState('');  // نص المودال
  const [fieldToEdit, setFieldToEdit] = useState(''); // الحقل الذي سيتم تعديله
  const [newValue, setNewValue] = useState(''); // القيمة الجديدة للمودال
  const [passwordModalVisible, setPasswordModalVisible] = useState(false); // للتحكم في عرض الموديل
  const [currentPassword, setCurrentPassword] = useState(''); // كلمة السر الحالية
  const [newPassword, setNewPassword] = useState(''); // كلمة السر الجديدة

 const handleChangePassword = async () => {
  if (!currentPassword.trim() || !newPassword.trim()) {
    Alert.alert('الرجاء ملء جميع الحقول');
    return;
  }

  try {
    console.log(email);
    const response = await axios.put(`${ipAdd}:8888/APIS/change-password`, {
      email,
      currentPassword,
      newPassword,
    });

    // معالجة الحالات بناءً على الرسالة من الـ backend
    const message = response.data.message;

    if (message === 'كلمة المرور الحالية غير صحيحة') {
      Alert.alert('كلمة المرور الحالية غير صحيحة');
    } else if (message === 'كلمة المرور الجديدة لا يمكن أن تكون نفس الحالية') {
      Alert.alert('كلمة المرور الجديدة لا يمكن أن تكون نفس الحالية');
    } else if (message === 'تم تغيير كلمة المرور بنجاح') {
      Alert.alert('تم تغيير كلمة المرور بنجاح');
      setPasswordModalVisible(false); // إغلاق الموديل
      setCurrentPassword('');
      setNewPassword('');
    } else {
      Alert.alert('حدث خطأ غير متوقع');
    }
  } catch (error) {
    Alert.alert('حدث خطأ أثناء الطلب، يرجى المحاولة لاحقًا');
    console.error('Error:', error);
  }
};


  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        const decodedToken = jwt_decode(storedToken);
        setToken(decodedToken);
        setEmail(decodedToken.email);
        setParentId(decodedToken.id);
        loadImage(decodedToken.email);
      }
    } catch (error) {
      console.log('Error loading token from AsyncStorage:', error);
    }
  };

  const loadImage = async (email) => {
    try {
      const savedImage = await AsyncStorage.getItem(`userProfileImage_${email}`);
      if (savedImage) {
        setImage(savedImage);
      }
    } catch (error) {
      console.log('Error loading image from AsyncStorage:', error);
    }
  };

  const fetchParentData = async () => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/user-profile/${parentId}`);
      setParentData(response.data);
    } catch (error) {
      console.log('Error fetching parent data:', error);
    }
  };

  useEffect(() => {
    if (parentId) {
      fetchParentData();
    }
  }, [parentId]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImage(selectedImageUri);
        if (email) {
          await AsyncStorage.setItem(`userProfileImage_${email}`, selectedImageUri);
        }
      } else {
        Alert.alert('لم يتم اختيار أي صورة');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('حدث خطأ أثناء محاولة اختيار الصورة');
    }
  };

  const handleEdit = (field) => {
    // تعيين الحقول المناسبة بناءً على النوع
    const fieldMapping = {
      address: 'newAddress',
      contact: 'newContactNumber',
    };

    const apiField = fieldMapping[field] || field;
    const fieldLabel = field === 'address' ? 'العنوان' : 'رقم الهاتف'; // التسمية المناسبة

    setFieldToEdit(field); // تعيين الحقل المعدل
    setModalText(`أدخل ${fieldLabel} الجديد:`);
    setIsModalVisible(true); // عرض المودال
  };
  const handleSubmitEdit = async () => {
    if (newValue.trim()) {
      try {
        let updatedData = {};
  
        // تخصيص الحقل بناءً على الاختيار
        if (fieldToEdit === 'address') {
          updatedData = { newAddress: newValue };
        } else if (fieldToEdit === 'contact') {
          updatedData = { newContactNumber: newValue };
        }
  
        // إرسال الطلب إلى الـ API
        await axios.put(`${ipAdd}:8888/APIS/user-profile/update-${fieldToEdit}/${parentId}`, updatedData);
  
        Alert.alert('تم التعديل بنجاح');
        fetchParentData();
        setIsModalVisible(false);
        setNewValue('');  // مسح الحقل بعد التعديل
      } catch (error) {
        Alert.alert('حدث خطأ أثناء التعديل');
      }
    } else {
      Alert.alert('الرجاء إدخال قيمة صحيحة');
    }
  };
  
  

  if (hasPermission === null) {
    return <Text>جاري التحقق من الأذونات...</Text>;
  }

  if (hasPermission === false) {
    return <Text>لا توجد أذونات للوصول إلى معرض الصور!</Text>;
  }

  if (!token) {
    return <Text>جاري تحميل التوكين...</Text>;
  }

  return (
    <LinearGradient colors={["#e2e2e2", "#c9d6ff"]} style={styles.container}> 
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            source={image ? { uri: image } : require('../images/default_user.png')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIcon1} onPress={pickImage}>
            <FontAwesome name="pencil" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{parentData ? parentData.name : 'جاري تحميل البيانات...'}</Text>
        <Text style={styles.userInfo}>بريدك الإلكتروني : {email}</Text>
      </View>

      <View style={styles.detailsContainer}>
        {/* طباعة بيانات الأب مع العناوين */}
        {parentData && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.parentInfoTitle}>رقم هوية الأم:</Text>
              <Text style={styles.parentInfo}>{parentData.momId}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.parentInfoTitle}>تاريخ الميلاد:</Text>
              <Text style={styles.parentInfo}>{new Date(parentData.birthDate).toLocaleDateString()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.parentInfoTitle}>فصيلة الدم:</Text>
              <Text style={styles.parentInfo}>{parentData.bloodType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.parentInfoTitle}>رقم الهاتف:</Text>
              <Text style={styles.parentInfo}>{parentData.contactNumber}</Text>
              <TouchableOpacity style={styles.editIcon} onPress={() => handleEdit('contact')}>
                <FontAwesome name="pencil" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.parentInfoTitle}>العنوان:</Text>
              <Text style={styles.parentInfo}>{parentData.address}</Text>
              <TouchableOpacity style={styles.editIcon} onPress={() => handleEdit('address')}>
                <FontAwesome name="pencil" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
         <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Text style={styles.changePasswordText}>تغيير كلمة السر</Text>
        </TouchableOpacity>
      </View>

      {/* نافذة منبثقة مخصصة */}
      <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)} style={styles.modal}>
  <View style={styles.modalContent}>
    <Text style={styles.modalText}>{modalText}</Text>
    <TextInput
      style={styles.input}
      value={newValue}
      onChangeText={setNewValue}
      placeholder="أدخل القيمة الجديدة"
       placeholderTextColor="#999999"
            textAlign="right"
    />
    <TouchableOpacity style={styles.modalButton} onPress={handleSubmitEdit}>
      <Text style={styles.modalButtonText}>تعديل</Text>
    </TouchableOpacity>
  </View>
</Modal> 
{/* موديل تغيير كلمة السر */}
<Modal
        isVisible={passwordModalVisible}
        onBackdropPress={() => setPasswordModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>تغيير كلمة السر</Text>
          <TextInput
            style={styles.input}
            placeholder="كلمة السر الحالية"
            placeholderTextColor="#999"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="كلمة السر الجديدة"
            placeholderTextColor="#999"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            textAlign="right"
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
            <Text style={styles.modalButtonText}>تغيير</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#7494ec',
    backgroundColor: '#ddd',
  },
  editIcon: {
    position: 'absolute',
    left: 0, 
    backgroundColor: '#7494ec',
    borderRadius: 50,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    marginBottom: 30,
    alignItems: 'center',
  },
  parentInfoTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 5,
  },
  parentInfo: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    marginRight: 10,
    flexShrink: 1,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',  // لضبط النص في الجهة اليمنى
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'right',  // لضبط النص داخل المدخل في الجهة اليمنى
  },
  modalButton: {
    backgroundColor: '#7494ec',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  editIcon1: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#7494ec',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePasswordButton: {
    marginTop: 15,
    backgroundColor: '#7494ec',
    padding: 10,
    borderRadius: 5,
  },
  changePasswordText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
