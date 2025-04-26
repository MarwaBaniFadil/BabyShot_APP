import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Button, Alert, Modal } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import moment from 'moment';
import 'moment/locale/ar'; // لدعم اللغة العربية
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const ExpandableBoxes = () => {
  const [data, setData] = useState([
    { id: "1", items: ["الكل", "ذكر", "أنثى"], expanded: false, label: "الجنس", icon: "user", selected: "الكل" },
    { id: "2", items: ["الكل", "حديث الولادة", "شهر", "شهر - شهرين", "شهرين - 4 شهور", "4 شهور - 6 شهور", "6 شهور - سنة", "سنة - سنة ونصف", "سنة ونصف - 3 سنوات", "3 سنوات - 6 سنوات", "6 سنوات - 15 سنة", "15 سنة وأكثر"], expanded: false, label: "العمر", icon: "calendar", selected: "الكل" },
    { id: "3", items: ["الكل", "رام الله", "نابلس", "الخليل", "بيت لحم", "جنين"], expanded: false, label: "المدينة", icon: "map-marker", selected: "الكل" },
    { id: "4", items: ["الكل", "طبيعية", "عملية"], expanded: false, label: "نوع الولادة", icon: "child", selected: "الكل" },
  ]);

  const [childrenData, setChildrenData] = useState([]);
  const [childId, setChildId] = useState(""); 
  const [modalVisible, setModalVisible] = useState(false); 
  const [childDetails, setChildDetails] = useState(null); 
  const [detailsModalVisible, setDetailsModalVisible] = useState(false); 

  const toggleExpand = (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };
  const formatDate = (dateString) => {
    moment.locale('ar'); // ضبط اللغة العربية
    return moment(dateString).format('D MMMM YYYY'); // صيغة اليوم - شهر نصي - سنة
  };
  const handleSelectItem = (id, item) => {
    setData((prevData) =>
      prevData.map((category) =>
        category.id === id ? { ...category, selected: item, expanded: false } : category
      )
    );
  };

  const handleSearch = async () => {
    try {
      let filters = {
        gender: data[0].selected === "الكل" ? "" : data[0].selected,
        age: data[1].selected === "الكل" ? "" : data[1].selected,
        city: data[2].selected === "الكل" ? "" : data[2].selected,
        birth_type: data[3].selected === "الكل" ? "" : data[3].selected,
      };

      if (childId) {
        filters.child_id = childId;
      }

      const response = await axios.get(`${ipAdd}:8888/APIS/childrenfordoctor`, { params: filters });

      setChildrenData(response.data);
      setModalVisible(true);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء جلب البيانات.");
      console.error(error);
    }
  };

  const fetchChildDetails = async (child) => {
    try {
      const response = await axios.get(
        `${ipAdd}:8888/APIS/getChildAgeAndVaccine/${child.child_id}`
      );
      const childData = response.data;
      setChildDetails({ ...child, ...childData });
      setModalVisible(false);
      setDetailsModalVisible(true);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء جلب تفاصيل الطفل.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title1}>معلومات الطفل</Text>

      <View style={styles.whiteSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>رقم هوية الطفل:</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل رقم الهوية"
            textAlign="right"

            keyboardType="numeric"
            value={childId}
            onChangeText={(text) => setChildId(text)}
          />
        </View>

        {childId === "" && (
      <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <View style={styles.boxContainer}>
          <View style={styles.labelContainer}>
            <Icon name={item.icon} size={24} color="#333" />
            <Text style={styles.boxLabel}>{item.label}</Text>
          </View>
    
          <TouchableOpacity
            onPress={() => toggleExpand(item.id)}
            style={styles.header}
          >
            <Text style={styles.arrow}>{item.expanded ? "▲" : "▼"}</Text>
            <Text style={styles.headerText}>{item.selected}</Text>
          </TouchableOpacity>
    
          {item.expanded && (
            <View style={styles.content}>
              {item.items.map((subItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subItem}
                  onPress={() => handleSelectItem(item.id, subItem)}
                >
                  <Text>{subItem}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    />
    
        )}

        <View style={styles.searchButtonContainer}>
          <TouchableOpacity style={styles.search_button} onPress={handleSearch}>
      <Text style={styles.buttonText}>بحث</Text>
    </TouchableOpacity>
        </View>
      </View>

      {/* نافذة منبثقة لعرض بيانات الأطفال */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>بيانات الطفل</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>المزيد</Text>
              <Text style={styles.tableHeaderCell}>اسم الأب</Text>
              <Text style={styles.tableHeaderCell}>الاسم</Text>
              <Text style={styles.tableHeaderCell}>رقم الهوية</Text>
            </View>
            <FlatList
              data={childrenData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => fetchChildDetails(item)}
                  >
                    <Text style={styles.showMoreText}>عرض المزيد</Text>
                  </TouchableOpacity>
                  <Text style={styles.tableCell}>{item.father_name}</Text>
                  <Text style={styles.tableCell}>{item.name}</Text>
                  <Text style={styles.tableCell}>{item.child_id}</Text>
                </View>
              )}
            />
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
      <Text style={styles.buttonText}>إغلاق</Text>
    </TouchableOpacity>
          </View>
        </View>
      </Modal>

 {/* نافذة منبثقة لتفاصيل الطفل */}
<Modal
  animationType="slide"
  transparent={true}
  visible={detailsModalVisible}
  onRequestClose={() => setDetailsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.title}>تفاصيل الطفل</Text>
      {childDetails && (
        <>
          {Object.entries({
            "رقم الهوية": childDetails.child_id,
            "اسم الطفل": childDetails.name,
            "اسم الأب": childDetails.father_name,
            "اسم الأم": childDetails.mother_name,
            "العمر": `${childDetails.age.years} سنوات، ${childDetails.age.months} أشهر، ${childDetails.age.days} أيام`,
            "الجنس": childDetails.gender,
            "زمرة الدم": childDetails.blood_type,
            "تاريخ الميلاد": formatDate(childDetails.date_of_birth),
            "المدينة": childDetails.birth_place,
            "المشفى": childDetails.birth_hospital,
            "نوع الولادة": childDetails.birth_type,
            "الحالة الطبية": childDetails.medical_conditions,
            "أسابيع الحمل": childDetails.pregnancy_weeks,
            "وزن الولادة": childDetails.birth_weight,
            "طول الولادة": childDetails.birth_height,
            "رقم التواصل": childDetails.contactNumber,
          }).map(([label, value], index) => (
            <View style={styles.detailRow} key={index}>
            <Text style={styles.detailValue}>{value}</Text>

              <Text style={styles.detailLabel}>{label}:</Text>
            </View>
          ))}
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={() => setDetailsModalVisible(false)}>
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
    padding: 10,
    backgroundColor: "#e6f0ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#4e54c8",
  },
  title1: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#4e54c8",
    marginTop:20
  },
  whiteSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "right",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  boxContainer: {
    width: "48%",
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    overflow: "hidden",
    marginBottom: 10,
  },
  labelContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  boxLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop:8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#7494ec",
  },
  headerText: {
    color: "#fff",
    fontSize: 16,
  },
  arrow: {
    color: "#fff",
    fontSize: 16,
  },
  content: {
    backgroundColor: "#f2f2f2",
    padding: 10,
  },
  subItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  searchButtonContainer: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%", // تحديد أقصى ارتفاع للنافذة
    elevation: 5,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
  },
  tableHeaderCell: {
    width: "25%",
    textAlign: "center",
    fontWeight: "bold",
    fontSize:14,
    color: "#4e54c8",
  },
  tableCell: {
    width: "25%",
    textAlign: "center",
    color: "#333",
    fontWeight:"bold"
  },
  showMoreButton: {
    backgroundColor: "#4e54c8", // لون أزرق للكبسة
    borderRadius: 8, // زوايا مستديرة
    paddingVertical: 10, // ارتفاع داخلي
    paddingHorizontal: 4, // عرض داخلي
    alignItems: "center", // محاذاة النص في المنتصف
    justifyContent: "center", // محاذاة النص في المنتصف
   marginBottom:5,
   elevation: 3, // ظل للكبسة (على أندرويد)
   shadowColor: "#000", // لون الظل (iOS)
   shadowOffset: { width: 0, height: 2 }, // موضع الظل (iOS)
   shadowOpacity: 0.2, // شفافية الظل (iOS)
   shadowRadius: 4, // نصف قطر الظل (iOS)
  },
  showMoreText: {
    color: "#fff", // لون النص أبيض
    fontWeight: "bold", // النص عريض
    fontSize: 10, // حجم النص
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4e54c8",
    textAlign: "right",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    textAlign: "left",
    flex: 2,
    //fontWeight:"bold",
    textAlign:"right"
  },
  button: {
    backgroundColor: '#970e0e', // لون خلفية الزر (طماطمي مثلاً)
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15, // إذا أردت ترك مسافة حول الزر
    alignSelf: 'center', // يجعل الزر يأخذ الحجم المناسب بناءً على محتواه ويكون في المنتصف

  },
  buttonText: {
    color: '#ffffff', // لون النص (أبيض)
    fontSize: 16,
    fontWeight: 'bold',
  },
  search_button: {
    backgroundColor: '#4e54c8', // لون خلفية الزر
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8, // حواف مستديرة
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // ظل بسيط للزر
    marginTop:25,
  },
});

export default ExpandableBoxes;
