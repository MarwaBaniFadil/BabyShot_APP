import React, { useState ,useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal ,Button} from "react-native";
import axios from "axios";
import ipAdd from "C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress";
import Icon from 'react-native-vector-icons/MaterialIcons'; // استيراد أيقونات


export default function SearchChild() {
  const [childFatherNames, setChildFatherNames] = useState("");
  const [childId, setChildId] = useState("");
  const [childId1, setChildId1] = useState("");
  const [childId2, setChildId2] = useState('');
  const [childData, setChildData] = useState([]);
  const [modalVisible, setModalVisible1] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null); // لعرض تفاصيل الطفل عند الضغط على "عرض المزيد"
  const [isModalVisible, setModalVisible2] = useState(false);
  const [isModalVisible3, setModalVisible3] = useState(false);
  const [parentId, setParentId] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthHospital, setBirthHospital] = useState('');
  const [birthType, setBirthType] = useState('');
  const [pregnancyWeeks, setPregnancyWeeks] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [fieldToEdit, setFieldToEdit] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);

  
  // دالة لتحديد الحقل الذي سيتم تعديله
  const handleEdit = (field, currentValue) => {
    setFieldToEdit(field); // تعيين الحقل الذي سيتم تعديله
    setNewValue(currentValue); // تعيين القيمة الحالية ليتم تعديلها
    setError(''); // مسح أي رسالة خطأ قد تظهر
    console.log("fieldToEdit: ", fieldToEdit);
console.log("newValue: ", newValue);

  
    // إغلاق جميع النوافذ الأخرى
    setModalVisible1(false);
    setModalVisible2(false);
    setModalVisible3(false);
  
    // فتح النافذة المنبثقة الخاصة بالتعديل
    setModalVisibleEdit(true);
  
    // طباعة للتأكد من القيم
    console.log("Selected Child ID: ", selectedChild.child_id);
    console.log("Modal for Edit is now open.");
  };
  useEffect(() => {
    if (selectedChild && modalVisibleEdit) {
      // تحديث تفاصيل الموديل عند تعديل selectedChild
      console.log("تفاصيل الطفل بعد التعديل: ", selectedChild);
    }
  }, [selectedChild]);  // مراقبة selectedChild
  
  
   // حقول معلومات الطفل
  
  const handleSearchByName = async () => {
    const [childName, fatherName] = childFatherNames.split(" ");

    if (!childName || !fatherName) {
      Alert.alert("خطأ", "يرجى إدخال اسم الطفل واسم الأب.");
      return;
    }

    try {
      const response = await axios.post(`${ipAdd}:8888/APIS/search-child`, {
        child_name: childName,
        father_name: fatherName,
      });

      if (!response.data || !response.data.child || response.data.child.length === 0) {
        Alert.alert("لم يتم العثور", "لم يتم العثور على الطفل.");
      } else {
        setChildData(response.data.child);
      }
    } catch (error) {
      console.error("خطأ في البحث عن الطفل:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء البحث.");
    }

    // تفريغ الحقول بعد البحث
    setChildFatherNames("");
    setChildId("");
  };
  const handleSave = async () => {
    if (!newValue) {
      setError('يرجى إدخال قيمة صحيحة');
      return;
    }
  
    try {
      const response = await axios.patch(`${ipAdd}:8888/APIS/updateChildField/${selectedChild.child_id}`, {
        field: fieldToEdit,
        value: newValue,
      });
  
      if (response.status === 200) {
        // تحديث selectedChild مباشرة بالقيمة الجديدة
        const updatedChild = { ...selectedChild, [fieldToEdit]: newValue };
        setSelectedChild(updatedChild);  // تحديث الحالة في الوقت الفعلي
  
        // إضافة جملة الطباعة لمراجعة القيمة المعدلة
        console.log(`تم تحديث الحقل ${fieldToEdit} إلى القيمة: ${newValue}`);
        
        alert('تم تحديث البيانات بنجاح');
        setModalVisibleEdit(false);  // إغلاق النافذة المنبثقة بعد الحفظ
      } else {
        alert('فشل التحديث');
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء التحديث');
    }
  };
  
  
  
  
  
  
  const handleDeleteChild = async () => {
    if (!childId2) {
      return Alert.alert('تحذير', 'يرجى إدخال رقم هوية الطفل');
    }
  
    try {
      const response = await axios.delete(`${ipAdd}:8888/APIS/deleteChild/${childId2}`);
      
      if (response.status === 200) {
        const { message } = response.data;
  
        if (message === 'Child deleted successfully') {
          Alert.alert('تم الحذف', 'تم حذف الطفل بنجاح');
          setChildId2(''); // مسح حقل الإدخال
          setModalVisible3(false); // إغلاق النافذة المنبثقة
        } else if (message === 'No child found with the given ID') {
          Alert.alert('لم يتم العثور على الطفل', 'لم يتم العثور على طفل برقم الهوية المدخل');
        } else {
          Alert.alert('تنبيه', 'استجابة غير متوقعة من السيرفر');
        }
      } else {
        Alert.alert('خطأ', 'حدث خطأ في الطلب. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error(error);
  
      // التحقق من وجود رسالة خطأ من السيرفر
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('خطأ', error.response.data.message);
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء حذف الطفل. تأكد من اتصالك بالشبكة.');
      }
    }
  };
  
  const handleSearchById = async () => {
    if (!childId) {
      Alert.alert("خطأ", "يرجى إدخال معرف الطفل.");
      return;
    }

    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/child/${childId}`);

      if (!response.data || !response.data.child || response.data.child.length === 0) {
        Alert.alert("لم يتم العثور", "لم يتم العثور على الطفل.");
      } else {
        setChildData([response.data.child]);
      }
    } catch (error) {
      console.error("خطأ في البحث عن الطفل:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء البحث.");
    }

    // تفريغ الحقول بعد البحث
    setChildFatherNames("");
    setChildId("");
  };

  const handleViewMore = (child) => {
    setSelectedChild(child);
    setModalVisible1(true); // إظهار النافذة المنبثقة
  };
  const handleAddChild = async () => {
    // التحقق من وجود حقول فارغة
    if (
      !childId1 || !parentId || !name || !dateOfBirth || !gender || 
      !medicalConditions || !bloodType || !birthWeight || 
      !currentWeight || !currentHeight || !headCircumference || 
      !birthPlace || !birthHospital || !birthType || 
      !pregnancyWeeks || !birthHeight
    ) {
      alert('يرجى تعبئة جميع الحقول قبل الإضافة.');
      return; // لا نقوم بإتمام باقي العملية إذا كانت الحقول فارغة
    }
  
    try {
      const response = await axios.post(`${ipAdd}:8888/APIS/addChildren`, {
        child_id: childId1,
        mom_id: parentId,
        name: name,
        date_of_birth: dateOfBirth,
        gender: gender,
        medical_conditions: medicalConditions,
        blood_type: bloodType,
        birth_weight: birthWeight,
        current_weight: currentWeight,
        current_height: currentHeight,
        head_circumference: headCircumference,
        birth_place: birthPlace,
        birth_hospital: birthHospital,
        birth_type: birthType,
        pregnancy_weeks: pregnancyWeeks,
        birth_height: birthHeight,
      });
  
      console.log(response.data); // للتحقق من الاستجابة
  
      if (response.status === 200) {
        const { message } = response.data;
  
        if (message === "تم إضافة الطفل بنجاح") {
          setModalVisible2(false); // إغلاق النافذة
          alert('تمت إضافة الطفل بنجاح!');
  
          // إعادة تعيين الحقول بعد الإضافة
          setChildId1('');
          setParentId('');
          setName('');
          setDateOfBirth('');
          setGender('');
          setMedicalConditions('');
          setBloodType('');
          setBirthWeight('');
          setCurrentWeight('');
          setCurrentHeight('');
          setHeadCircumference('');
          setBirthPlace('');
          setBirthHospital('');
          setBirthType('');
          setPregnancyWeeks('');
          setBirthHeight('');
        } else if (message === "لا توجد أم لها رقم الهوية هذا") {
          alert('لا توجد أم لها رقم الهوية هذا');
        } else if (message === "هذا الطفل موجود مسبقًا في النظام") {
          alert('هذا الطفل موجود مسبقًا في النظام');
        } else {
          alert('استجابة غير متوقعة من السيرفر');
        }
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إضافة الطفل');
    }
  };
  
  
  
  
  

  const renderTable = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>عرض المزيد</Text>
        <Text style={styles.tableHeaderText}>اسم الأب</Text>
        <Text style={styles.tableHeaderText}>اسم الطفل</Text>
        <Text style={styles.tableHeaderText}>رقم الهوية </Text>
      </View>
      {childData.map((child, index) => (
        <View key={index} style={styles.tableRow}>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => handleViewMore(child)}
          >
            <Text style={styles.viewMoreButtonText}>عرض المزيد</Text>
          </TouchableOpacity>
          <Text style={styles.tableCell}>{child.father_name}</Text>
          <Text style={styles.tableCell}>{child.child_name}</Text>
          <Text style={styles.tableCell}>{child.child_id}</Text>
        </View>
      ))}
    </View>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible1(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedChild && (
            <>
              <Text style={styles.modalTitle}>تفاصيل الطفل</Text>
  
              {[ 
                { label: "اسم الطفل", field: "name", value: selectedChild.child_name },
                { label: "هوية الطفل", field: "child_id", value: selectedChild.child_id.toString() },
                { label: "تاريخ الميلاد", field: "date_of_birth", value: selectedChild.date_of_birth.split("T")[0] },
                { label: "الجنس", field: "gender", value: selectedChild.gender },
                { label: "زمرة الدم", field: "blood_type", value: selectedChild.blood_type },
                { label: "وزن الولادة", field: "birth_weight", value: `${selectedChild.birth_weight} كجم` },
                { label: "طول الولادة", field: "birth_height", value: `${selectedChild.birth_height} سم` },
                { label: "نوع الولادة", field: "birth_type", value: selectedChild.birth_type },
                { label: "مكان الولادة", field: "birth_place", value: selectedChild.birth_place },
                { label: "المستشفى", field: "birth_hospital", value: selectedChild.birth_hospital },
                { label: "أسابيع الحمل", field: "pregnancy_weeks", value: selectedChild.pregnancy_weeks.toString() },
                { label: "الحالة الطبية", field: "medical_conditions", value: selectedChild.medical_conditions },
              ].map(({ label, field, value }) => (
                <View style={styles.modalRow} key={field}>
                  <TouchableOpacity
                    style={styles.edit}
                    onPress={() => handleEdit(field, value)}
                  >
                    <Icon name="edit" size={20} color="#7494ec" />
                  </TouchableOpacity>
                  <Text style={styles.modalText}>{value}</Text>
                  <Text style={styles.modalLabel}>{label}:</Text>
                </View>
              ))}
  
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible1(false)}
              >
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
  
  const translateFieldName = (field) => {
    switch (field) {
      case 'name':
        return 'اسم الطفل';
      case 'child_id':
        return 'هوية الطفل';
      case 'date_of_birth':
        return 'تاريخ الميلاد';
      case 'gender':
        return 'الجنس';
      case 'blood_type':
        return 'زمرة الدم';
      case 'birth_weight':
        return 'وزن الولادة';
      case 'birth_height':
        return 'طول الولادة';
      case 'birth_type':
        return 'نوع الولادة';
      case 'birth_place':
        return 'مكان الولادة';
      case 'birth_hospital':
        return 'المستشفى';
      case 'pregnancy_weeks':
        return 'أسابيع الحمل';
      case 'medical_conditions':
        return 'الحالة الطبية';
      // أضف المزيد من الحقول حسب الحاجة
      default:
        return field; // في حال لم يوجد حقل معروف نعرضه كما هو
    }
  };
  
  const renderModal2 = () => (
    
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisibleEdit}
      onRequestClose={() => setModalVisibleEdit(false)}
    >
      <View style={styles.modalContainerEdit}>
        <View style={styles.modalContentEdit}>
          <Text style={styles.modalTitle1}>تعديل {translateFieldName(fieldToEdit)}</Text>
          <TextInput
            style={styles.input1}
            value={newValue}
            onChangeText={setNewValue}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisibleEdit(false)}
          >
            <Text style={styles.closeButtonText}>إغلاق</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>حفظ التعديلات</Text>
          </TouchableOpacity>
         
          </View>
        </View>
      </View>
    </Modal>
  );
  

  return (
    <View style={styles.container}>

 <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible3}
        onRequestClose={() => setModalVisible3(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal1}>
            <Text style={styles.modalTitle1}>حذف طفل</Text>
            <Text style={styles.label2}>أدخل رقم هوية الطفل :</Text>

            <TextInput
              style={styles.input1}
              placeholder="رقم هوية الطفل"
              keyboardType="numeric"
              value={childId2}
              onChangeText={setChildId2}
            />
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible3(false)}>
  <Text style={styles.buttonText}>إلغاء</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button} onPress={handleDeleteChild}>
  <Text style={styles.buttonText}>حذف</Text>
</TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
<Modal
  visible={isModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible2(false)}
>
  <View style={styles.modalContainer1}>
    <View style={styles.modalContent1}>
      <Text style={styles.modalTitle1}>إضافة طفل جديد</Text>

      <View style={styles.inputGroup}>
      <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>رقم هوية الأم</Text>
          <TextInput
            style={styles.input1}
            value={parentId}
            onChangeText={setParentId}
            keyboardType="numeric"
          />
        </View>
      <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}> رقم هوية الطفل</Text>
          <TextInput
            style={styles.input1}
            value={childId1}
            onChangeText={setChildId1}
          />
        </View>
        

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>اسم الطفل</Text>
          <TextInput
            style={styles.input1}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>تاريخ الميلاد</Text>
          <TextInput
            style={styles.input1}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الجنس</Text>
          <TextInput
            style={styles.input1}
            value={gender}
            onChangeText={setGender}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الحالات الطبية</Text>
          <TextInput
            style={styles.input1}
            value={medicalConditions}
            onChangeText={setMedicalConditions}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>فصيلة الدم</Text>
          <TextInput
            style={styles.input1}
            value={bloodType}
            onChangeText={setBloodType}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>وزن الولادة</Text>
          <TextInput
            style={styles.input1}
            value={birthWeight}
            onChangeText={setBirthWeight}
            
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الوزن الحالي</Text>
          <TextInput
            style={styles.input1}
            value={currentWeight}
            onChangeText={setCurrentWeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الطول الحالي</Text>
          <TextInput
            style={styles.input1}
            value={currentHeight}
            onChangeText={setCurrentHeight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>محيط الرأس</Text>
          <TextInput
            style={styles.input1}
            value={headCircumference}
            onChangeText={setHeadCircumference}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>مكان الولادة</Text>
          <TextInput
            style={styles.input1}
            value={birthPlace}
            onChangeText={setBirthPlace}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>مستشفى الولادة</Text>
          <TextInput
            style={styles.input1}
            value={birthHospital}
            onChangeText={setBirthHospital}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>نوع الولادة</Text>
          <TextInput
            style={styles.input1}
            value={birthType}
            onChangeText={setBirthType}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>أسابيع الحمل</Text>
          <TextInput
            style={styles.input1}
            value={pregnancyWeeks}
            onChangeText={setPregnancyWeeks}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>طول الولادة</Text>
          <TextInput
            style={styles.input1}
            value={birthHeight}
            onChangeText={setBirthHeight}
          />
        </View>
      </View>

<View style={styles.buttonContainer}>
<TouchableOpacity
    style={styles.button} // تصميم الزر
    onPress={() => setModalVisible2(false)}
  >
    <Text style={styles.buttonText}>إلغاء</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.button} // تصميم الزر
    onPress={() => {
      handleAddChild(); // استدعاء دالة الإضافة
      //setModalVisible2(false); // إغلاق النافذة
    }}
  >
    <Text style={styles.buttonText}>إضافة</Text>
  </TouchableOpacity>

 
</View>

    </View>
  </View>
</Modal>

      <View style={styles.rowSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (childFatherNames) {
              handleSearchByName();
            } else if (childId) {
              handleSearchById();
            } else {
              Alert.alert("خطأ", "يرجى إدخال البيانات للبحث.");
            }
          }}
        >
          <Text style={styles.buttonText}>بحث</Text>
        </TouchableOpacity>
        
        <View style={styles.inputSection}>

          <Text style={styles.label}>اسم الطفل واسم الأب</Text>
          <TextInput
            style={styles.input}
            value={childFatherNames}
            onChangeText={setChildFatherNames}
            placeholder="أدخل اسم الطفل واسم الأب"
          />
        
          <TouchableOpacity style={styles.removeButton} onPress={() => setModalVisible3(true)}>
            <Text style={styles.buttonText}>حذف طفل</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>رقم هوية الطفل</Text>
          <TextInput
            style={styles.input}
            value={childId}
            onChangeText={setChildId}
            placeholder="أدخل معرف الطفل"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible2(true)} >
            <Text style={styles.buttonText}>إضافة طفل</Text>
          </TouchableOpacity>
         
        </View>
      </View>

      <ScrollView>{childData.length > 0 && renderTable()}</ScrollView>
      {renderModal()}
      {renderModal2()}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e6f0ff",
  },
  rowSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  inputSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
    textAlign:"right",
    fontWeight:"bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "white",
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
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  tableContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7494ec",
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  viewMoreButton: {
    backgroundColor: "#7494ec",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'flex-end', // لضبط النص عاليمين
  },
  modalLabel: {
    fontWeight: 'bold', // العنوان بالخط العريض
    fontSize: 14,
    marginLeft: 0, // مسافة بين العنوان والقيمة
    width: '40%', // تخصيص عرض العنوان
    textAlign: 'right', // الكتابة تكون عاليمين

  },
  modalText: {
    fontSize: 14,
    textAlign: 'right', // الكتابة تكون عاليمين
    width: '55%', // تخصيص عرض القيمة
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
  edit: {
    marginLeft:20,
  },


  modalContainer1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent1: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color:"#4e54c8",
    textAlign:"center"
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
  
  input1Focused: {
    borderColor: '#007bff', // تغيير اللون عند التركيز
    backgroundColor: '#e6f7ff', // خلفية خفيفة عند التركيز
    elevation: 5, // تأثير ظل أقوى عند التركيز
    shadowOpacity: 0.2, // شفافية الظل عند التركيز
  },
  
  inputGroup: {
    flexDirection: 'row',  // جعل الحقول في صف واحد
    flexWrap: 'wrap',      // يسمح للحقول بالانتقال إلى السطر التالي إذا لم تتسع
    justifyContent: "space-evenly", // توزيع المسافة بين الحقول
  },
  
  inputContainer: {
    width: '48%',  // حقلين في الصف الواحد مع مسافة بينهما
    marginBottom: 5,  // لضبط المسافة بين الحقول
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,  // لإعطاء مساحة بين الليبل والانبوت
    color: '#333',  // يمكن تعديل اللون حسب الحاجة
    textAlign:"right",
  },
  
  buttonContainer: {
    flexDirection: 'row', // لضبط الأزرار بجانب بعض
    justifyContent: 'space-between',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal1: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  label1: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight:"bold",
  },
  label2: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'right',
  },
  modalContainerEdit: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // خلفية شفافة داكنة
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
  
});
