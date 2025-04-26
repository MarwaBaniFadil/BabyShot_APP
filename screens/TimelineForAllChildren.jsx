import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image,Modal,Button } from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import jwtDecode from "jwt-decode"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';




const SearchChild = () => {
  const [children, setChildren] = useState([]);
  const [parentNames, setParentNames] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [tests, setTests] = useState({});
  const [showTests, setShowTests] = useState({});
  const [noTests, setNoTests] = useState({}); // حالة لعدم وجود فحوصات
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTestDetails, setNewTestDetails] = useState({
    childId: "",
    testName: "",
    description: "",
    result: "",
    headCircumference: "",
    weight: "",
    height: "",
  });

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axios.get(`${ipAdd}:8888/APIS/showallchildren`);
        const data = res.data.children || [];
        setChildren(data);

        const parentPromises = data.map((child) =>
          axios
            .get(`${ipAdd}:8888/APIS/getPerent/${child.parent_id}`)
            .then((response) => ({
              childId: child.child_id,
              parentName: response.data.users[0]?.husbandName || "غير محدد",
            }))
        );

        const parentResults = await Promise.all(parentPromises);
        const parentNameMap = parentResults.reduce((acc, { childId, parentName }) => {
          acc[childId] = parentName;
          return acc;
        }, {});
        setParentNames(parentNameMap);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب بيانات الأطفال:", error);
      }
    };

    fetchChildren();
  }, []);

  const fetchTests = async (childId) => {
    if (showTests[childId]) {
      setShowTests((prev) => ({ ...prev, [childId]: false }));
      return;
    }

    if (tests[childId]) {
      setShowTests((prev) => ({ ...prev, [childId]: true }));
      return;
    }

    try {
      const res = await axios.get(`${ipAdd}:8888/APIS/showAlltestToChildrenById/${childId}`);
      const data = res.data.users || [];

      if (data.length === 0) {
        setNoTests((prev) => ({ ...prev, [childId]: true })); // لا يوجد فحوصات
        setShowTests((prev) => ({ ...prev, [childId]: true }));
        return;
      }

      const testsWithDetails = await Promise.all(
        data.map(async (test) => {
          const doctorRes = await axios.get(`${ipAdd}:8888/APIS/showdoctornameByid/${test.doctor_id}`);
          const clinicRes = await axios.get(`${ipAdd}:8888/APIS/showclinicnameByid/${test.clinic_id}`);
          return {
            ...test,
            doctorName: doctorRes.data.users[0]?.name || "غير محدد",
            clinicName: clinicRes.data.users[0]?.name || "غير محدد",
          };
        })
      );

      setTests((prevTests) => ({ ...prevTests, [childId]: testsWithDetails }));
      setShowTests((prev) => ({ ...prev, [childId]: true }));
      setNoTests((prev) => ({ ...prev, [childId]: false })); // توجد فحوصات
    } catch (error) {
      console.error(`حدث خطأ أثناء جلب الفحوصات للطفل ${childId}:`, error);
    }
  };

  const handleSearch = () => {
    const queryLower = searchQuery.toLowerCase();
    const filtered = children.filter((child) => {
      const childFullName = `${child.name} ${parentNames[child.child_id] || ""}`.toLowerCase();
      const childId = child.child_id.toString();
      return childFullName.includes(queryLower) || childId.includes(queryLower);
    });
    setFilteredChildren(filtered);
  };

 
  const handleAddTest = () => {
    setIsModalVisible(true);
  };
  const handleSaveTest = async () => {
    try {
      // استرجاع التوكن من AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("لا يمكن العثور على التوكن. الرجاء تسجيل الدخول مرة أخرى.");
        return;
      }
  // استدعاء API للحصول على بيانات الطفل
  const response = await axios.get(`${ipAdd}:8888/APIS/childinfo/${newTestDetails.childId}`);
  const { child_info } = response.data;

  if (!child_info) {
    alert("تعذر العثور على بيانات الطفل. تحقق من رقم الهوية.");
    return;
  }

  const { Birth_month, Birth_Year, Childs_age_in_months } = child_info;
console.log(Birth_month);
console.log(Birth_Year);
console.log(Childs_age_in_months);
      // فك تشفير التوكن
      const decodedToken = jwtDecode(token);
      const doctorId = decodedToken.id; // اسم الحقل بناءً على البيانات المخزنة في التوكن
      const clinicId = decodedToken.clinic_id; // اسم الحقل بناءً على البيانات المخزنة في التوكن
  
      if (!doctorId || !clinicId) {
        alert("لا يمكن العثور على بيانات الطبيب أو العيادة في التوكن.");
        return;
      }
  
      // الحصول على التاريخ الحالي بصيغة yyyy-mm-dd
      const today = new Date().toISOString().split("T")[0];
  
      // إعداد البيانات لواجهة API الخاصة بالقياس
      const measurementPayload = {
        child_id: newTestDetails.childId,
        Birth_month: Birth_month,
        Birth_Year: Birth_Year,
        head_circumference: newTestDetails.headCircumference,
        height: newTestDetails.height,
        weight: newTestDetails.weight,
        Childs_age_in_months_at_the_time_of_measurement: Childs_age_in_months,
      };
  
      // استدعاء API لإضافة القياس
      const addMeasurementResponse = await axios.post(
        `${ipAdd}:8888/APIS/addchildmeasurements`,
        measurementPayload
      );
  
      if (addMeasurementResponse.status !== 201) {
        alert("حدث خطأ أثناء إضافة القياسات.");
        return;
      }
  
      // إعداد البيانات لواجهة API الخاصة بالفحص
      const testPayload = {
        name: newTestDetails.testName,
        description: newTestDetails.description,
        test_date: today,
        test_result: newTestDetails.result,
        child_id: newTestDetails.childId,
        clinic_id: clinicId,
        doctor_id: doctorId,
      };
  
      // استدعاء API لإضافة الفحص
      const addTestResponse = await axios.post(
        `${ipAdd}:8888/APIS/addTest`,
        testPayload
      );
  
      if (addTestResponse.status === 200) {
        alert("تمت إضافة الفحص والقياسات بنجاح!");
        setIsModalVisible(false);
  
        // إعادة تعيين الحقول
        setNewTestDetails({
          childId: "",
          testName: "",
          description: "",
          result: "",
          headCircumference: "",
          weight: "",
          height: "",
        });
      } else {
        alert("حدث خطأ أثناء إضافة الفحص.");
      }
    } catch (error) {
      console.error("خطأ أثناء حفظ الفحص:", error);
      alert("حدث خطأ. الرجاء المحاولة لاحقًا.");
    }
  };
  
  
  const handleInputChange = (field, value) => {
    setNewTestDetails((prevDetails) => ({ ...prevDetails, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>فحوصات الأطفال</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="اسم الطفل أو اسم الأب أو رقم الطفل"
          textAlign="right"
          placeholderTextColor="#A9A9A9"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleAddTest}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {filteredChildren.length > 0 ? (
        <FlatList
          data={filteredChildren}
          keyExtractor={(item) => item.child_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <View style={styles.row}>
                <Text style={styles.text}>اسم الأب: {parentNames[item.child_id] || "غير محدد"}</Text>
                <Text style={styles.text}>اسم الطفل: {item.name}</Text>
                <Text style={styles.text}>رقم الطفل: {item.child_id}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewTestsButton}
                onPress={() => fetchTests(item.child_id)}
              >
                <Text style={styles.viewTestsButtonText}>
                  {showTests[item.child_id] ? "إخفاء الفحوصات" : "عرض الفحوصات"}
                </Text>
              </TouchableOpacity>
              {showTests[item.child_id] && noTests[item.child_id] && (
                <Text style={styles.noTestsMessage}>لا توجد فحوصات لهذا الطفل</Text>
              )}
              {showTests[item.child_id] && !noTests[item.child_id] && (
                <FlatList
                  data={tests[item.child_id]}
                  keyExtractor={(test) => test.id.toString()}
                  renderItem={({ item: test }) => (
                    <View style={styles.testItem}>
                      <Text style={styles.testItemText}>
                        <Text style={styles.testItemLabel}>اسم الفحص: </Text>
                        {test.name}
                      </Text>
                      <Text style={styles.testItemText}>
                              <Text style={styles.testItemLabel}>الوصف: </Text>
                              {test.description}
                            </Text>
                            <Text style={styles.testItemText}>
                              <Text style={styles.testItemLabel}>التاريخ: </Text>
                              {new Date(test.test_date).toLocaleDateString()}
                            </Text>
                            <Text style={styles.testItemText}>
                              <Text style={styles.testItemLabel}>النتيجة: </Text>
                              {test.test_result}
                            </Text>
                            <Text style={styles.testItemText}>
                              <Text style={styles.testItemLabel}>اسم الطبيب: </Text>
                              {test.doctorName}
                            </Text>
                            <Text style={styles.testItemText}>
                              <Text style={styles.testItemLabel}>اسم العيادة: </Text>
                              {test.clinicName}
                            </Text>
                      {/* باقي التفاصيل */}
                    </View>
                  )}
                />
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Image source={require("../images/te.png")} style={styles.noResultsImage} />
        </View>
      )}
         {/* النافذة المنبثقة */}
         <Modal visible={isModalVisible} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>إضافة فحص جديد</Text>

      {/* إدخال رقم هوية الطفل */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>رقم الهوية:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="رقم هوية الطفل"
          value={newTestDetails.childId}
          onChangeText={(text) => handleInputChange("childId", text)}
        />
      </View>

      {/* إدخال اسم الفحص */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>اسم الفحص:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="اسم الفحص"
          value={newTestDetails.testName}
          onChangeText={(text) => handleInputChange("testName", text)}
        />
      </View>

      {/* إدخال الوصف */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>الوصف:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="الوصف"
          value={newTestDetails.description}
          onChangeText={(text) => handleInputChange("description", text)}
        />
      </View>

      {/* إدخال النتيجة */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>النتيجة:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="النتيجة"
          value={newTestDetails.result}
          onChangeText={(text) => handleInputChange("result", text)}
        />
      </View>

      {/* إدخال محيط الرأس */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>محيط الرأس:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="محيط الرأس"
          value={newTestDetails.headCircumference}
          onChangeText={(text) => handleInputChange("headCircumference", text)}
        />
      </View>

      {/* إدخال الوزن */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>الوزن:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="الوزن"
          value={newTestDetails.weight}
          onChangeText={(text) => handleInputChange("weight", text)}
        />
      </View>

      {/* إدخال الطول */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>الطول:</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="الطول"
          value={newTestDetails.height}
          onChangeText={(text) => handleInputChange("height", text)}
        />
      </View>

      {/* الأزرار */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTest}>
          <Text style={styles.buttonText}>إضافة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, { marginLeft: 10 }]}
          onPress={() => setIsModalVisible(false)}
        >
          <Text style={styles.buttonText}>إلغاء</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  // نفس التنسيقات السابقة
  noTestsMessage: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  container: { flex: 1, padding: 20, backgroundColor: "#e6f0ff" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#4e54c8",
    marginTop:20
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginLeft:10
  },
  iconButton: { width: 50, height: 50, backgroundColor: "#7494ec", borderRadius: 8, justifyContent: "center", alignItems: "center", marginLeft: 5 },
  resultItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderColor: "#4e54c8",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },  viewTestsButton: { backgroundColor: "#7494ec", padding: 10, borderRadius: 8, marginTop: 10, alignItems: "center" },
  viewTestsButtonText: { color: "#fff", fontWeight: "bold" },
  testItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  testItemText: {
    fontSize: 16,
    color: "#2d3436",
    marginBottom: 8,
    textAlign:"right"
  },
  testItemLabel: {
    fontWeight: "bold", // العناوين بخط غامق
    color: "#4e54c8", // لون أزرق للعناوين
  },
  noResultsContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noResultsImage: { width: 300, height: 300, marginBottom: 20 },
  noData: { fontSize: 16, color: "gray" },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "black",
    flex: 1,
    textAlign: "center",
    fontWeight:"bold"
  },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15,
  },
    modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color:"#4e54c8",
    marginBottom:20,
    textAlign:"center"
  },
    label: {
      fontSize: 16,
      color: "black",
      fontWeight: "bold",
      flex: 1,
      textAlign: "right",
    },
    modalInput: {
      flex: 2,
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 20,
      borderColor: "#ccc",
      backgroundColor: "#f9f9f9",
    },
    buttonRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      marginTop: 20,
    },
    saveButton: {
      backgroundColor: "#7494ec",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: "#970e0e",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
  
});

export default SearchChild;
