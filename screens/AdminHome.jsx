import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // لاستخراج التوكن المخزن
import jwtDecode from "jwt-decode"; // مكتبة فك التوكن

export default function AdminHome({ navigation }) {
  const [roleMessage, setRoleMessage] = useState("");

  useEffect(() => {
    const fetchRoleMessage = async () => {
      try {
        const token = await AsyncStorage.getItem("token"); // استبدل "token" باسم المفتاح الصحيح
        if (token) {
          const decodedToken = jwtDecode(token); // فك التوكن باستخدام jwt-decode
          setRoleMessage(decodedToken.roleMessage || "مرحباً بك!"); // استبدل "roleMessage" بالمفتاح الصحيح
        } else {
          setRoleMessage("مرحباً بك!"); // في حال عدم وجود توكن
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setRoleMessage("مرحباً بك!"); // في حال حدوث خطأ
      }
    };

    fetchRoleMessage();
  }, []);

  return (
    <View style={styles.container}>
      {/* المنحنى */}
      <View style={styles.curve}>
        <View style={styles.curveShape} />
      </View>

      {/* النص العلوي */}
      <View style={styles.content}>
        <Text style={styles.heading}>{roleMessage}</Text>
      </View>

      {/* الصورة */}
      <Image
        source={require("../images/Admin1.png")} // استبدل بمسار الصورة الصحيح
        style={styles.family}
      />

      {/* الأقسام */}
      <View style={styles.features}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("MothersSection")}
        >
          <Ionicons name="woman" size={40} color="#7494ec" />
          <Text style={styles.boxText}>الأمهات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("ChildrenSection")}
        >
          <FontAwesome5 name="baby" size={40} color="#7494ec" />
          <Text style={styles.boxText}>الأطفال</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("DoctorsSection")}
        >
          <MaterialCommunityIcons name="doctor" size={40} color="#7494ec" />
          <Text style={styles.boxText}>الأطباء</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("StatisticsSection")}
        >
          <FontAwesome5 name="chart-bar" size={40} color="#7494ec" />
          <Text style={styles.boxText}>الإحصائيات</Text>
        </TouchableOpacity>
         {/* زر إرسال الإشعار */}
         <TouchableOpacity style={styles.box} 
         onPress={() => navigation.navigate("AdminNotification")}>
          <MaterialCommunityIcons name="bell" size={40} color="#7494ec" />
          <Text style={styles.boxText}>إرسال إشعار</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("ratingD")}
        >
          <MaterialCommunityIcons name="star" size={40} color="#7494ec" />
          <Text style={styles.boxText}>التقييمات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f0ff",
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
  heading: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign:"center",
  },
  family: {
    marginTop: 55,
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginVertical: 20,
    width: "90%",
  },
  box: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  boxText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#7494ec",
    textAlign: "center",
  },
});
