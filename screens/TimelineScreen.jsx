import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


export default function TimelineScreen() {
  const [childrenData, setChildrenData] = useState([]);
  const [testsData, setTestsData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const fetchChildren = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("لا يوجد توكن");
        return;
      }

      const decodedToken = jwt_decode(token);
      const parentId = decodedToken.id;

      const response = await axios.get(
        `${ipAdd}:8888/APIS/getChildrenByParentId/${parentId}`
      );

      const children = response.data.users.map((child) => ({
        label: child.name,
        value: child.child_id,
        gender: child.gender,
      }));

      setChildrenData(children);
    } catch (error) {
      console.error("حدث خطأ أثناء جلب الأطفال:", error);
    }
  };

  const fetchTestsForChild = async (childId) => {
    try {
      const response = await axios.get(
        `${ipAdd}:8888/APIS/showAlltestToChildrenById/${childId}`
      );

      const tests = await Promise.all(
        response.data.users.map(async (test) => {
          const { doctorName, clinicName } = await fetchDoctorAndClinicNames(test);
          return {
            ...test,
            doctorName,
            clinicName,
          };
        })
      );

      tests.sort((a, b) => new Date(a.test_date) - new Date(b.test_date));

      setTestsData(tests);
      setSelectedChild(childId);
    } catch (error) {
      console.error("حدث خطأ أثناء جلب الاختبارات:", error);
    }
  };

  const fetchDoctorAndClinicNames = async (test) => {
    try {
      const doctorResponse = await axios.get(
        `${ipAdd}:8888/APIS/showdoctornameByid/${test.doctor_id}`
      );
      const clinicResponse = await axios.get(
        `${ipAdd}:8888/APIS/showclinicnameByid/${test.clinic_id}`
      );

      const doctorName = doctorResponse.data.users[0]?.name || "غير متوفر";
      const clinicName = clinicResponse.data.users[0]?.name || "غير متوفر";

      return {
        doctorName,
        clinicName,
      };
    } catch (error) {
      console.error("خطأ أثناء جلب أسماء الطبيب أو العيادة:", error);
      return {
        doctorName: "غير متوفر",
        clinicName: "غير متوفر",
      };
    }
  };

  React.useEffect(() => {
    fetchChildren();
  }, []);

  return (
    <View style={styles.container}>
      {!selectedChild && (
  <Text style={styles.header}>اختر الطفل الذي تريد أن ترى فحوصاته</Text>
)}
       
      {!selectedChild ? (
        <>
          <FlatList
            data={childrenData}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.childItem}
                onPress={() => fetchTestsForChild(item.value)}
              >
                <Text style={styles.childName}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <Image
            source={require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/health-check.png")}
            style={styles.image}
          />
        </>
      ) : (
        <ScrollView style={styles.testContainer}>
          {testsData.map((test, index) => (
            <View key={index} style={styles.testCard}>
              <Image
                source={require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/pin.png")} 
                style={styles.pinIcon}
              />
              <Text style={styles.testField}>
                <Text style={styles.fieldLabel}> وصف الفحص : </Text>
                {test.description}
              </Text>
              <Text style={styles.testField}>
                <Text style={styles.fieldLabel}>التاريخ : </Text>
                {new Date(test.test_date).toLocaleDateString()}
              </Text>
              <Text style={styles.testField}>
                <Text style={styles.fieldLabel}>نتيجة الفحص : </Text>
                {test.test_result}
              </Text>
              <Text style={styles.testField}>
                <Text style={styles.fieldLabel}> الطبيب : </Text>
                {test.doctorName}
              </Text>
              <Text style={styles.testField}>
                <Text style={styles.fieldLabel}> العيادة : </Text>
                {test.clinicName}
              </Text>
            </View>
          ))}
          <Button
           mode="outlined"
  title="العودة إلى القائمة"
  onPress={() => setSelectedChild(null)}
  color="#7494ec" // لتحديد لون الزر
  style={styles.backButton}
/>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#e6f0ff",
  },
  childItem: {
    padding: 18,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#7494ec",
    transition: "all 0.3s ease",
  },
  childName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 40,
    marginLeft:20,
  },
  testContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  testCard: {
    padding: 20,
    marginVertical: 12,
    backgroundColor: "white",
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#7494ec",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  pinIcon: {
    position: 'absolute',
    top: -8,
    right: 0,
    width: 24,
    height: 24,
  },
  testField: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    textAlign: 'right', // محاذاة النص إلى اليمين
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#7494ec",
    textAlign: 'right', // محاذاة النص إلى اليمين
  },
  backButton: {
    marginTop: 20, alignSelf: 'center' 
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#4e54c8",
  },
});
