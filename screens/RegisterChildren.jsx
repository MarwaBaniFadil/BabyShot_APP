import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";

export default function RegisterChildren({ navigation }) {
  return (
    <View style={styles.container}>
      {/* المنحنى */}
      <View style={styles.curve}>
        <View style={styles.curveShape} />
      </View>

      {/* النص العلوي */}
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          اكتشفي كل ما تحتاجينه عن صحة أطفالك في مكان واحد{"\n"}من فحوصاتهم،
          وطعوماتهم، إلى تتبع نموهم وإحصائياتهم الدقيقة{"\n"}
        </Text>
        <Text style={styles.heading}>اجعلي العناية بصحة أطفالك أسهل وأسرع</Text>
      </View>

      {/* الصورة */}
      <Image
        source={require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/family(1).webp")} // استبدل بمسار الصورة الصحيح
        style={styles.family}
      />

      {/* الخصائص الأولى */}
      <View style={styles.features}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("Timeline")}
        >
          <FontAwesome5 name="clipboard-check" size={40} color="#7494ec" />
          <Text style={styles.boxText}>سجل فحوصات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("VaccineDetails")}
        >
          <MaterialCommunityIcons name="needle" size={40} color="#7494ec" />
          <Text style={styles.boxText}>سجل طعومات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("ChildBooklet")}
        >
          <FontAwesome5 name="baby" size={40} color="#7494ec" />
          <Text style={styles.boxText}>معلومات الطفل</Text>
        </TouchableOpacity>
      </View>

      {/* الخصائص الثانية */}
      <View style={styles.features}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("SideEffect")}
        >
          <AntDesign name="heart" size={40} color="#7494ec" />
          <Text style={styles.boxText}>آثار جانبية متوقعة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("CalculaterTochild")}
        >
          <FontAwesome5 name="calculator" size={40} color="#7494ec" />
          <Text style={styles.boxText}>حاسبة نمو الطفل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("Charts")}
        >
          <FontAwesome5 name="chart-line" size={40} color="#7494ec" />
          <Text style={styles.boxText}>مقاييس وإحصائيات الطفل</Text>
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
  paragraph: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  heading: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  family: {
    marginTop: 30,
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-evenly",
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
