import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import jwtDecode from "jwt-decode";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const AppointmentsScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments();
    }
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("Token not found in storage!");
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const clinicId = decodedToken.clinic_id;
      if (!clinicId) {
        alert("Clinic ID not found in token!");
        setLoading(false);
        return;
      }

      const formattedDate = selectedDate.toISOString().split("T")[0];
      const apiUrl = `${ipAdd}:8888/APIS/appointments/${formattedDate}/${clinicId}`;
      const response = await axios.get(apiUrl);
      const appointmentsData = response.data;

      const enrichedAppointments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          try {
            const childResponse = await axios.get(
              `${ipAdd}:8888/APIS/showallchildrenbyid/${appointment.child_id}`
            );
            const childData = childResponse.data.users[0];

            let husbandName = "غير متوفر";
            let nextVaccine = "غير متوفر";

            if (childData.parent_id) {
              try {
                const parentResponse = await axios.get(
                  `${ipAdd}:8888/APIS/registrations/${childData.parent_id}`
                );
                husbandName = parentResponse.data.husbandName;
              } catch (error) {
                console.error(
                  `Error fetching husband name for parent_id ${childData.parent_id}:`,
                  error
                );
              }
            }

            try {
              const vaccineResponse = await axios.get(
                `${ipAdd}:8888/APIS/getNextAge/${appointment.child_id}`
              );
              nextVaccine = vaccineResponse.data.nextAge;
            } catch (error) {
              console.error(
                `Error fetching next vaccine for child_id ${appointment.child_id}:`,
                error
              );
            }

            return {
              time: appointment.appointment_time,
              childId: appointment.child_id,
              childName: childData.name,
              husbandName: husbandName,
              nextVaccine: nextVaccine,
              status: appointment.status,
              appointmentId: appointment.record_id, // معرف الموعد
              isComplete: appointment.status === "مكتملة", // لتخزين حالة الطعم
            };
          } catch (error) {
            console.error(`Error fetching child data for child_id ${appointment.child_id}:`, error);
            return {
              time: appointment.appointment_time,
              childId: appointment.child_id,
              childName: "اسم غير متوفر",
              husbandName: "غير متوفر",
              nextVaccine: "غير متوفر",
            };
          }
        })
      );

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Failed to fetch appointments!");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus, childId, nextVaccine) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const doctorId = decodedToken.id; // استخراج معرف الطبيب من التوكين
  
      const apiUrl = `${ipAdd}:8888/APIS/updateAppointmentStatus`;
  
      // إرسال البيانات المطلوبة في الـ body
      await axios.post(apiUrl, {
        record_id: appointmentId, // المعرف الخاص بالموعد
        status: newStatus,         // الحالة الجديدة
        doctor_id: doctorId,       // معرف الطبيب
      });
  
      // إذا كانت الحالة مكتملة، نرسل طلب آخر لتحديث حالة الطعم
      if (newStatus === "مكتملة") {
        console.log(nextVaccine);
        console.log(childId);

        const vaccineApiUrl = `${ipAdd}:8888/APIS/updateVaccineStatusDONE`;
  
        await axios.post(vaccineApiUrl, {
          id_child: childId,         // معرف الطفل
          nextVaccine: nextVaccine, // الطعم القادم
        });
      }
  
      // تحديث الحالة محليًا
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.appointmentId === appointmentId
            ? { ...appointment, status: newStatus, isComplete: newStatus === "مكتملة" }
            : appointment
        )
      );
  
      alert("تم تحديث حالة الطعم بنجاح!");
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("فشل في تحديث حالة الطعم!");
    }
  };
  
  const vaccineAges = {
    month0: "حديث الولادة",
    month1: "الشهر الأول",
    month2: "الشهر الثاني",
    month4: "الشهر الرابع",
    month6: "الشهر السادس",
    month12: "السنة الأولى",
    month18: "السنة والنصف",
    year6: "السنة السادسة",
    year15: "السنة الخامسة عشرة",
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Text style={styles.appointmentText}>
        <Text style={styles.label}>وقت الطعم :  </Text>
        <Text style={styles.value}>{item.time}</Text>
      </Text>
      <Text style={styles.appointmentText}>
        <Text style={styles.label}>رقم هوية الطفل :  </Text>
        <Text style={styles.value}>{item.childId}</Text>
      </Text>
      <Text style={styles.appointmentText}>
        <Text style={styles.label}>اسم الطفل :  </Text>
        <Text style={styles.value}>
          {item.childName} {""} {item.husbandName}
        </Text>
      </Text>
      <Text style={styles.appointmentText}>
        <Text style={styles.label}>الحالة  :  </Text>
        <Text style={styles.value}>{item.status}</Text>
      </Text>
      <Text style={styles.appointmentText}>
        <Text style={styles.label}>الطعم القادم :  </Text>
        <Text style={styles.value}>
          {vaccineAges[item.nextVaccine] || "غير متوفر"}
        </Text>
      </Text>

      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={[styles.radioButton, item.isComplete && styles.selectedRadio]}
          onPress={() => {
            if (!item.isComplete) {
              updateAppointmentStatus(item.appointmentId, "مكتملة", item.childId, item.nextVaccine);
            }
          }}
        >
          <Text style={styles.radioButtonText}>مكتملة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioButton, !item.isComplete && styles.selectedRadio]}
        >
          <Text style={styles.radioButtonText}>مجدولة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    <FlatList
      data={appointments}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderAppointment}
      ListHeaderComponent={
        <>
          <Calendar
            onDayPress={(day) => setSelectedDate(new Date(day.dateString))}
            markedDates={{
              [selectedDate ? selectedDate.toISOString().split("T")[0] : ""]: {
                selected: true,
                selectedColor: "#4e54c8",
              },
            }}
            theme={{
              calendarBackground: "#f4f4f4",
              textSectionTitleColor: "#4e54c8",
              selectedDayBackgroundColor: "#4e54c8",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#ff5722",
              dayTextColor: "#000000",
              arrowColor: "#4e54c8",
              textDayFontWeight: "bold",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "bold",
            }}
            style={styles.calendar}
          />
          <Text style={styles.title}>المواعيد </Text> 
        </>
      }
      ListFooterComponent={
        loading && (
          <ActivityIndicator size="large" color="#4e54c8" style={{ marginTop: 20 }} />
        )
      }
      ListEmptyComponent={
        !loading && (
          <Text style={styles.noAppointments}>لا توجد مواعيد للطعم لهذا التاريخ</Text>
        )
      }
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f0ff",
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#ddd", // لون أفتح لحدود أكثر أناقة
    padding: 10, // إضافة بعض المساحة الداخلية
    width: "90%", // جعل العرض نسبة مئوية ليتناسب مع كل الشاشات
    height: 330, // زيادة الطول قليلاً ليبدو أكثر راحة
    alignSelf: "center",
    borderRadius: 12, // زيادة استدارة الزوايا
    backgroundColor: "#f9f9f9", // إضافة خلفية فاتحة لإبراز التقويم
    shadowColor: "#000", // إضافة ظل لإبراز العنصر
    shadowOffset: { width: 0, height: 2 }, // اتجاه الظل
    shadowOpacity: 0.2, // شفافية الظل
    shadowRadius: 6, // انتشار الظل
    elevation: 4, // للظل على أجهزة أندرويد
    marginBottom:10,
    marginTop:10,
  },
  
  appointmentsContainer: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4e54c8",
    textAlign: "right",
    textAlign:"center",
    marginBottom:20,
  },
  appointmentItem: {
    padding: 15,
    backgroundColor: "#ffffff", // خلفية بيضاء للمواعيد
    marginBottom: 10, // مسافة بين العناصر
    borderRadius: 10, // استدارة الحواف
    elevation: 2, // تأثير الظل على أجهزة أندرويد
    shadowColor: "#000", // لون الظل
    shadowOffset: { width: 0, height: 1 }, // اتجاه الظل
    shadowOpacity: 0.2, // شفافية الظل
    shadowRadius: 2, // مدى انتشاره
    borderWidth: 1, // إضافة حدود خفيفة حول العنصر
    borderColor: "#ddd", // لون الحدود
    marginHorizontal: 10, // إضافة مسافة أفقية بين العناصر
    paddingVertical: 12, // تعديل المسافة الرأسية داخل العنصر
    flexDirection: "column", // ترتيب العناصر بشكل عمودي داخل العنصر
  },
  
  appointmentText: {
    fontSize: 16,
    textAlign: "right",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold", // العناوين بولد
  },
  value: {
    fontWeight: "normal", // القيم عادية
  },
  noAppointmentsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  radioButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#3d85c6",
    width: "45%",
    alignItems: "center",
  },
  selectedRadio: {
    backgroundColor: "#7494ec",
  },
  radioButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  title1: {
    fontSize: 18, // حجم النص كبير
    fontWeight: "bold", // النص بولد
    textAlign: "center", // النص في المنتصف
    color: "#4e54c8", // لون النص (يمكن تغييره حسب رغبتك)
    marginVertical: 5, // مسافة عمودية
  },
  noAppointments: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontWeight: "bold",
    fontStyle: "italic",
  },
});

export default AppointmentsScreen;
