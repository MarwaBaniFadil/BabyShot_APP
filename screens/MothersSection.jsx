import React, { useState } from 'react';
import { View, TextInput, Button, Text, FlatList, Modal, StyleSheet, TouchableOpacity, Keyboard, Alert ,Image} from 'react-native';
import axios from 'axios';
import ipAdd from "C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress";
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import photo from '../images/mother.png'; // استيراد الصورة


const MotherInfoSearch = () => {
  const [motherId, setMotherId] = useState('');
  const [motherData, setMotherData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMotherInfo, setSelectedMotherInfo] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newMotherData, setNewMotherData] = useState({
    momId: '',
    email: '',
    password: '',
    name: '',
    birthDate: '',
    bloodType: '',
    childrenCount: '',
    husbandName: '',
    husbandId: '',
    address: '',
    contactNumber: ''
  });

  const fieldTranslations = {
    "اسم الأم": "name",
    "اسم الزوج": "husbandName",
    "تاريخ الميلاد": "birthDate",
    "زمرة الدم": "bloodType",
    "عدد الأطفال": "childrenCount",
    "رقم هوية الزوج": "husbandId",
    "العنوان": "address",
    "رقم الهاتف": "contactNumber"
  };

  const handleSearch = async () => {
    if (!motherId) {
      Alert.alert('يرجى إدخال رقم هوية الأم');
      return;
    }

    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/mother/${motherId}`);
      
      if (response.status === 200) {
        if (response.data.message && response.data.message === "لم يتم العثور على بيانات للأم بهذا الرقم.") {
          Alert.alert('لم يتم العثور على بيانات للأم بهذا الرقم.');
          setMotherData(null); 
        } else {
          setMotherData(response.data);
          
        }
      }
    } catch (error) {
      setMotherData(null);
      Alert.alert('حدث خطأ أثناء الاتصال بالخادم');
    }

    Keyboard.dismiss();
  };

  const handleShowDetails = (mother) => {
    const { momId, name, husbandName, birthDate, bloodType, childrenCount, husbandId, address, contactNumber } = motherData;
    
    const formattedBirthDate = moment(birthDate).format('YYYY-MM-DD');
  
    const additionalInfo = {
      "اسم الأم": name,
      "تاريخ الميلاد": formattedBirthDate,
      "زمرة الدم": bloodType,
      "عدد الأطفال": childrenCount,
      "اسم الزوج": husbandName,
      "رقم هوية الزوج": husbandId,
      "العنوان": address,
      "رقم الهاتف": contactNumber,
    };
  
    setSelectedMotherInfo(additionalInfo);
    setModalVisible(true);
  };

  const handleEdit = (field, value) => {
    setEditField(field);
    setNewValue(value);
    setModalVisible(false);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!newValue) {
      Alert.alert('يرجى إدخال القيمة الجديدة');
      return;
    }

    const fieldInEnglish = fieldTranslations[editField];
    const updatedData = { [fieldInEnglish]: newValue };

    try {
      const response = await axios.put(`${ipAdd}:8888/APIS/update-registration`, {
        momId: motherId,
        updatedData: updatedData,
      });

      if (response.status === 200) {
        Alert.alert('تم التعديل بنجاح');
        setMotherData((prevData) => {
          const updatedData = { ...prevData };
          updatedData[fieldInEnglish] = newValue;
          return updatedData;
        });
        setEditModalVisible(false);
      } else {
        Alert.alert('فشل التعديل، حاول مرة أخرى');
      }
    } catch (error) {
      Alert.alert('حدث خطأ أثناء التعديل');
    }
  };

  const handleAddMother = async () => {
    try {
      console.log(newMotherData);
      const response = await axios.post(`${ipAdd}:8888/APIS/add-registration`, newMotherData);
  
      if (response.status === 200) {
        const { message, missingFields } = response.data;
  
        // تحقق من محتوى الرسالة لتحديد الحالة
        if (message === "تم") {
          Alert.alert("نجاح", "تمت إضافة الأم بنجاح");
          setAddModalVisible(false);
          setNewMotherData({
            momId: "",
            email: "",
            password: "",
            name: "",
            birthDate: "",
            bloodType: "",
            childrenCount: "",
            husbandName: "",
            husbandId: "",
            address: "",
            contactNumber: "",
          });
        } else if (message === "يرجى ملء جميع الحقول.") {
          Alert.alert(
            "تنبيه",
           "يرجى ملء جميع الحقول المطلوبة"
          );
        } else if (message === "الأم موجودة بالفعل في النظام.") {
          Alert.alert("تنبيه", "الأم موجودة بالفعل في النظام");
        } else {
          Alert.alert("خطأ", "حدث خطأ غير متوقع");
        }
      } else {
        Alert.alert("فشل", "فشل الإضافة، حاول مرة أخرى");
      }
    } catch (error) {
      console.error("خطأ أثناء الإضافة:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء الإضافة");
    }
  };
  

  const renderMotherData = () => {
    if (!motherData) return null;

    const { momId, name, husbandName } = motherData;
    const data = [
      { key: 'رقم هوية الأم', value: momId },
      { key: 'اسم الأم', value: name },
      { key: 'اسم الزوج', value: husbandName },
    ];

    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>عرض المزيد</Text> 
          <Text style={styles.headerText}>اسم الزوج</Text>
          <Text style={styles.headerText}>اسم الأم</Text>
          <Text style={styles.headerText}>رقم هوية الأم</Text>
        </View>

        <FlatList
          data={[{ momId, name, husbandName }]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => handleShowDetails(item)}
              >
                <Text style={styles.viewMoreButtonText}>عرض المزيد</Text>
              </TouchableOpacity>
              <Text style={styles.tableCell}>{item.husbandName}</Text>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.momId}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  const renderModalContent = () => {
    if (!selectedMotherInfo) return null;
  
    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>تفاصيل الأم</Text>
        {Object.entries(selectedMotherInfo).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <TouchableOpacity
              style={styles.edit}
              onPress={() => handleEdit(key, value)}
            >
              <Icon name="edit" size={20} color="#7494ec" />
            </TouchableOpacity>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.key}>{key}:</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>إغلاق</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEditModal = () => {
    return (
      <Modal
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentEdit}>
            <Text style={styles.modalTitle}>تعديل {editField}</Text>
            <TextInput
              style={styles.input1}
              placeholder={`أدخل قيمة جديدة لـ ${editField}`}
              value={newValue}
              onChangeText={setNewValue}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.searchButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
                <Text style={styles.searchButtonText}>تعديل</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

const renderAddModal = () => {
  return (
    <Modal
      visible={isAddModalVisible}
      onRequestClose={() => setAddModalVisible(false)}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContentEdit}>
          <Text style={styles.modalTitle}>إضافة أم جديدة</Text>

                <View style={styles.inputGroup}>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>اسم الأم</Text>
            <TextInput
              style={styles.input1}
              placeholder="اسم الأم"
              value={newMotherData.name}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>رقم هوية الأم</Text>
            <TextInput
              style={styles.input1}
              placeholder="رقم الهوية"
              value={newMotherData.momId}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, momId: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input1}
              placeholder="البريد الإلكتروني"
              value={newMotherData.email}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, email: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>كلمة المرور</Text>
            <TextInput
              style={styles.input1}
              placeholder="كلمة المرور"
              value={newMotherData.password}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, password: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>تاريخ الميلاد</Text>
            <TextInput
              style={styles.input1}
              placeholder="تاريخ الميلاد"
              value={newMotherData.birthDate}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, birthDate: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>زمرة الدم</Text>
            <TextInput
              style={styles.input1}
              placeholder="زمرة الدم"
              value={newMotherData.bloodType}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, bloodType: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>عدد الأطفال</Text>
            <TextInput
              style={styles.input1}
              placeholder="عدد الأطفال"
              value={newMotherData.childrenCount}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, childrenCount: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>اسم الزوج</Text>
            <TextInput
              style={styles.input1}
              placeholder="اسم الزوج"
              value={newMotherData.husbandName}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, husbandName: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>رقم هوية الزوج</Text>
            <TextInput
              style={styles.input1}
              placeholder="رقم هوية الزوج"
              value={newMotherData.husbandId}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, husbandId: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>العنوان</Text>
            <TextInput
              style={styles.input1}
              placeholder="العنوان"
              value={newMotherData.address}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, address: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <TextInput
              style={styles.input1}
              placeholder="رقم الهاتف"
              value={newMotherData.contactNumber}
              onChangeText={(text) => setNewMotherData({ ...newMotherData, contactNumber: text })}
            />
          </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setAddModalVisible(false)}>
              <Text style={styles.searchButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAddMother}>
              <Text style={styles.searchButtonText}>إضافة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


  return (
    <View style={styles.container}>
    <TouchableOpacity 
  style={styles.addMotherContainer} 
  onPress={() => setAddModalVisible(true)}
>
  <Icon name="add" size={20} color="white" style={styles.addIcon} />
  <Text style={styles.searchButtonText}>إضافة أم جديدة</Text>
</TouchableOpacity>
      <View style={styles.inputContainer1}>
        <Text style={styles.label}>رقم هوية الأم:</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل رقم هوية الأم"
          value={motherId}
          onChangeText={setMotherId}
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>بحث</Text>
      </TouchableOpacity>

      {renderMotherData()}

      <Modal
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {renderModalContent()}
        </View>
      </Modal>

      {renderEditModal()}
      {renderAddModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#e6f0ff",

  },
  inputContainer: {
    width: '48%',  // حقلين في الصف الواحد مع مسافة بينهما
    marginBottom: 5,  
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 5
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "white",
    fontSize: 16
  },
  searchButton: {
    backgroundColor: "#7494ec",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight:"bold"
  },
  tableContainer: {
    marginTop: 20,
    width: '100%',
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7494ec",
    padding: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    width: '25%',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    backgroundColor:"white"
  },
  tableCell: {
    padding: 10,
    flex: 1,
    textAlign: 'center',
  },
  viewMoreButtonText: {
    color: "white",
    fontSize: 14,
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
  row: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  key: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 0,
    width: '40%',
    textAlign: 'right',
  },
  value: {
    fontSize: 14,
    textAlign: 'right',
    width: '55%',
  },
  viewMoreButton: {
    backgroundColor: "#7494ec",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#7494ec",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  modalContentEdit: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // لإضافة ظل على الأندرويد
    shadowColor: '#000', // لإضافة ظل على iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input1: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc', // لون حدود أخف
    borderRadius: 10, // حواف أكثر انحناءً
    padding: 10, // حشو أكبر للراحة
    marginBottom: 10, // زيادة المسافة بين الحقول
    backgroundColor: '#f9f9f9', // خلفية خفيفة
    fontSize: 16, // حجم خط أكبر
    color: '#333', // لون النص أغمق
    fontFamily: 'Arial', // اختيار خط مناسب
    elevation: 3, // تأثير الظل الخفيف للظهور
    shadowColor: '#000', // الظل
    shadowOpacity: 0.1, // شفافية الظل
    shadowRadius: 5, // حجم الظل
    shadowOffset: { width: 0, height: 2 }, // اتجاه الظل
    textAlign:"right",
  },
  buttonContainer: {
    flexDirection: 'row', // لضبط الأزرار بجانب بعض
    justifyContent: "space-between",
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: "#7494ec",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#7494ec",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    //alignContent:"flex-end",
    alignSelf: "flex-end",
    marginLeft: 5,
    marginRight:5,
  },
  addButton: {
    backgroundColor: '#7494ec',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',  // جعل الحقول في صف واحد
    flexWrap: 'wrap',      // يسمح للحقول بالانتقال إلى السطر التالي إذا لم تتسع
    justifyContent: "space-evenly", // توزيع المسافة بين الحقول
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,  // لإعطاء مساحة بين الليبل والانبوت
    color: '#333',  // يمكن تعديل اللون حسب الحاجة
    textAlign:"right",
  },
  inputContainer1:{
    width: '80%',
    marginBottom: 20
  },
  addMotherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7494ec',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  addIcon: {
    marginRight: 10, // لإضافة مسافة بين الأيقونة والنص
  },

});

export default MotherInfoSearch;
