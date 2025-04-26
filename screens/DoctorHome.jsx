import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";

export default function DoctorPage({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Top Curve */}
        <View style={styles.curve}>
          <View style={styles.curveShape} />
        </View>

        {/* Header Text */}
        <View style={styles.content}>
          <Text style={styles.paragraph}>
            احصل على الأدوات اللازمة لمتابعة صحة الأطفال{"\n"}وتنظيم عملك
            في العيادة بكل سهولة{"\n"}
          </Text>
        </View>

        {/* Image */}
        <Image
          source={require("../images/doctor.png")} // Replace with the correct image path
          style={styles.family}
        />

        {/* Row 1: 3 Boxes */}
        <View style={[styles.featuresRow, { marginTop: 60 }]}>
        <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("TimelineForAllChildren")}
          >
            <FontAwesome5 name="clipboard-check" size={40} color="#7494ec" />
            <Text style={styles.boxText}>سجل فحوصات الاطفال</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("VaccineDoctor")}
          >
            <MaterialCommunityIcons name="needle" size={40} color="#7494ec" />
            <Text style={styles.boxText}>سجل طعومات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("ChildBookletForAllChildren")}
          >
            <FontAwesome5 name="baby" size={40} color="#7494ec" />
            <Text style={styles.boxText}>معلومات الاطفال</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: 4 Boxes */}
        <View style={[styles.featuresRow, { marginTop:0 }]}>
          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("FutureBookingsForDoctor")}
          >
            <AntDesign name="calendar" size={30} color="#7494ec" />
            <Text style={styles.boxText}>عرض مواعيد العيادة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("ClinicChatPage")}
          >
            <FontAwesome5 name="comments" size={30} color="#7494ec" />
            <Text style={styles.boxText}>محادثة الامهات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("VaccineDetailsDoctor")}
          >
            <FontAwesome5 name="clipboard-list" size={30} color="#7494ec" />
            <Text style={styles.boxText}>الطعومات في العيادة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("SchedulerScreenFromDoctor")}
          >
            <AntDesign name="calendar" size={40} color="#7494ec" />
            <Text style={styles.boxText}>حجز موعد للطفل</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f0ff",
    alignItems: "center",
  },
  scrollContainer: {
    alignItems: "center",
  },
  curve: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 300,
    backgroundColor: "#7494ec",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  content: {
    marginTop: 50,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  paragraph: {
    textAlign: "center",
    fontSize: 19,
    color: "white",
    fontWeight: "bold",
    marginTop: 40,
  },
  family: {
    marginTop: 40,
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  featuresRow: {
    flexDirection: "row", // جعل العناصر في صف واحد
    justifyContent: "flex-start", // توزيع العناصر بالتساوي
    marginVertical: 30, // مسافة بين الصفوف
    width: "90%", // عرض الصف
  },
  box: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 90, // عرض المربع
    height: 90, // ارتفاع المربع
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    margin:5,
  },
  boxText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "bold",
    color: "#7494ec",
    textAlign: "center",
  },
});
