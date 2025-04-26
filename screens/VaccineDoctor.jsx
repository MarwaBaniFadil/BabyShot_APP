import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { FontAwesome } from '@expo/vector-icons'; // إضافة أيقونات
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const VaccineDoctor = () => {
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [parents, setParents] = useState({});
  const [vaccinationData, setVaccinationData] = useState({});
  const [nextVaccination, setNextVaccination] = useState({});
  const [filters, setFilters] = useState({ name: "" });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const childrenResponse = await axios.get(
        `${ipAdd}:8888/APIS/showallchildren`
      );
      const childrenData = childrenResponse.data.children;
      setChildren(childrenData);
      setFilteredChildren(childrenData);

      const parentPromises = childrenData.map((child) =>
        axios
          .get(`${ipAdd}:8888/APIS/getPerent/${child.parent_id}`)
          .then((response) => ({
            childId: child.child_id,
            parentName: response.data.users[0]?.husbandName || "غير محدد",
          }))
      );

      const parentResults = await Promise.all(parentPromises);

      const parentsMap = parentResults.reduce(
        (acc, { childId, parentName }) => ({ ...acc, [childId]: parentName }),
        {}
      );

      setParents(parentsMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinationData = async (childId) => {
    try {
      const response = await axios.get(
        `${ipAdd}:8888/APIS/vaccineschild/${childId}`
      );
      
      if (response.data.message === "No vaccination records found for this child ID.") {
        setVaccinationData((prevData) => ({
          ...prevData,
          [childId]: { message: "لا توجد بيانات لقاحات لهذا الطفل" },
        }));
      } else {
        const data = response.data.users[0];
        setVaccinationData((prevData) => ({
          ...prevData,
          [childId]: data,
        }));
      }
    } catch (error) {
      console.error(`Error fetching vaccination data for child ${childId}:`, error);
    }
  };

  const fetchNextVaccination = async (childId) => {
    try {
      const ageResponse = await axios.get(
        `${ipAdd}:8888/APIS/getNextAge/${childId}`
      );
  
      const dateResponse = await axios.get(
        `${ipAdd}:8888/APIS/getFutureAppointmentsByChildId/${childId}`
      );
  
      let nextVaccineName = "لا يوجد , تم إنهاء جميع الطعومات المطلوبة.";
      if (ageResponse.data.nextAge) {
        nextVaccineName = ageToName(ageResponse.data.nextAge);
      }
  
      let nextVaccineDate = "لا يوجد تاريخ.";
      let source = null;
  
      if (Array.isArray(dateResponse.data) && dateResponse.data.length > 0) {
        nextVaccineDate = new Date(
          dateResponse.data[0].appointment_day
        ).toLocaleDateString("ar-EG");
        source = "مجدول";
      } else {
        const fallbackResponse = await axios.get(
          `${ipAdd}:8888/APIS/getChildAgeAndVaccine/${childId}`
        );
  
        if (fallbackResponse.data.nextVaccineDate) {
          nextVaccineDate = new Date(
            fallbackResponse.data.nextVaccineDate
          ).toLocaleDateString("ar-EG");
          source = "مقترح";
        }
      }
  
      setNextVaccination((prevData) => ({
        ...prevData,
        [childId]: { name: nextVaccineName, date: nextVaccineDate, source },
      }));
    } catch (error) {
      console.error(`Error fetching next vaccination for child ${childId}:`, error);
      setNextVaccination((prevData) => ({
        ...prevData,
        [childId]: { name: "خطأ في جلب البيانات", date: "خطأ في جلب البيانات", source: null },
      }));
    }
  };
  
  
  
  
  

  const applyFilters = () => {
    const filtered = children.filter((child) => {
      const parentName = parents[child.child_id] || "";
      const childFullName = `${child.name} ${parentName}`;
      return (
        child.name.includes(filters.name) ||
        parentName.includes(filters.name) ||
        childFullName.includes(filters.name)
      );
    });

    setFilteredChildren(filtered);

    // Fetch vaccination data for each filtered child
    filtered.forEach((child) => {
      fetchVaccinationData(child.child_id);
      fetchNextVaccination(child.child_id);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // تحويل الأعمار إلى أسماء
  const ageToName = (age) => {
    const ageMapping = {
      "month0": "حديث الولادة",
      "month1": "الشهر الأول",
      "month2": "الشهر الثاني",
      "month4": "الشهر الرابع",
      "month6": "الشهر السادس",
      "month12": "السنة الأولى",
      "month18": "السنة والنصف",
      "year6": "السنة السادسة",
      "year15": "السنة الخامسة عشرة",
    };
    return ageMapping[age] || `السن: ${age}`;
  };

  return (
    <View style={styles.container}>
            <Text style={styles.title1}>تفاصيل طعومات الأطفال</Text>

      <Text style={styles.label}>أدخل اسم الطفل أو الأب</Text>
      <TextInput
        style={styles.input}
        placeholder="أدخل الاسم هنا"
        textAlign="right"

        value={filters.name}
        onChangeText={(text) => setFilters({ ...filters, name: text })}
      />
      <TouchableOpacity style={styles.button} onPress={applyFilters}>
        <Text style={styles.buttonText}>بحث</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView style={styles.results}>
          {filteredChildren.map((child) => (
            <View key={child.child_id} style={styles.resultItem}>
              <Text style={styles.resultText}>
                {child.name} - {parents[child.child_id] || "غير محدد"}
              </Text>
              {vaccinationData[child.child_id] && (
                <View style={styles.vaccinationDetails}>
                  {vaccinationData[child.child_id].message ? (
                    <Text style={styles.vaccinationText}>{vaccinationData[child.child_id].message}</Text>
                  ) : (
                    Object.entries(vaccinationData[child.child_id]).map(
                      ([age, status]) =>
                        age !== "id_child" && (
                          <View key={age} style={styles.vaccinationItem}>
                             <Text style={styles.vaccinationText}>
                              {ageToName(age)}
                            </Text>
                            <Text style={styles.vaccinationText}>  </Text>

                             <FontAwesome
                              name={status === 1 ? "check-circle" : "times-circle"}
                              size={20}
                              color={status === 1 ? "blue" : "red"}
                            />
                           
                          </View>
                        )
                    )
                  )}
   {nextVaccination[child.child_id] && nextVaccination[child.child_id].name !== "لا يوجد , تم إنهاء جميع الطعومات المطلوبة." && (
  <View style={styles.vaccinationItem1}>
    <Text style={styles.vaccinationText1}>
      الطعم القادم: {nextVaccination[child.child_id].name}
    </Text>
    {nextVaccination[child.child_id].date && nextVaccination[child.child_id].date !== "لا يوجد تاريخ." && (
      <Text style={styles.vaccinationText1}>
        التاريخ: {nextVaccination[child.child_id].date}{" "}
        {nextVaccination[child.child_id].source && `(${nextVaccination[child.child_id].source})`}
      </Text>
    )}
  </View>
)}

                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e6f0ff",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    fontWeight: 'bold', // تحسين وضوح النص
    textAlign:"right"
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 16, // تحسين وضوح النص داخل المدخل
  },
  button: {
    backgroundColor: "#7494ec",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: '#000', // إضافة ظل لجعل الزر يبرز
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  results: {
    marginTop: 20,
  },
  resultItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: '#000', // إضافة ظل للعناصر لتمييزها
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  resultText: {
    fontSize: 18,
    color: "#333",
    fontWeight: 'bold', // تحسين وضوح اسم الطفل
    textAlign:"center",
    
  },
  vaccinationDetails: {
    marginTop: 20,
    paddingLeft: 10,

  },
  vaccinationText: {
    fontSize: 14,
    color: "black",
    fontWeight:"bold",
  },
  vaccinationItem: {
    flexDirection: 'row-reverse',  // المحاذاة من اليمين لليسار
    alignItems: 'center',
    marginBottom: 5,

  },
  vaccinationItem1: {
    marginBottom: 10, // مسافة بين كل عنصرين
    marginTop:10
  },
  vaccinationText1: {
    fontSize: 14,
    color: "#4e54c8",
    marginBottom: 5, // مسافة بين الأسطر
    textAlign:"right",
    fontWeight:"bold"
  },
  icon: {
    marginRight: 8, // مسافة بين الأيقونة والنص
  },
  messageBox: {
    padding: 10,
    backgroundColor: "#ffcc00", // خلفية تنبيه
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ff9900", // لون الحدود
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  title1: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#4e54c8",
    marginTop:10
  },
});

export default VaccineDoctor;
