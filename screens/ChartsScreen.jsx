import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


export default function ChildrenScreen() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idealData, setIdealData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [activeChart, setActiveChart] = useState("height");
  const [realData, setRealData] = useState([]);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchParentIdAndChildren = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("لا يوجد توكن");
          return;
        }

        const decodedToken = jwt_decode(token);
        const parentId = decodedToken.id;

        const response = await axios.get(`${ipAdd}:8888/APIS/getChildrenByParentId/${parentId}`);
        const childrenData = response.data.users.map((child) => ({
          label: child.name,
          value: child.child_id,
          gender: child.gender,
        }));

        setChildren(childrenData);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب الأطفال:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParentIdAndChildren();
  }, []);

  const handleChildSelect = async (child) => {
    setSelectedChild(child);  // تحديد الطفل المختار

    try {
      const apiEndpoint =
        child.gender === "Male"
          ? `${ipAdd}:8888/APIS/ideal_child_data`
          : `${ipAdd}:8888/APIS/ideal_child_data_female`;

      const response = await axios.get(apiEndpoint);
      const dataKey =
        child.gender === "Male" ? "ideal_child_data" : "ideal_child_data_famale";

      if (response.data[dataKey]) {
        const idealData = response.data[dataKey];
        setIdealData(idealData);
        updateChartData(idealData, realData, activeChart);
      }

      const realDataResponse = await axios.get(`${ipAdd}:8888/APIS/weightHight/${child.value}`);
      setRealData(realDataResponse.data.child);

    } catch (error) {
      console.error("حدث خطأ أثناء جلب البيانات:", error);
    }
  };

  const updateChartData = (idealData, realData, type) => {
    let idealDataPoints = [];
    let realDataPoints = [];

    switch (type) {
      case "height":
        idealDataPoints = idealData.map((item) => item.height_cm);
        realDataPoints = realData.map((item) => item.height);
        break;
      case "weight":
        idealDataPoints = idealData.map((item) => item.weight_kg);
        realDataPoints = realData.map((item) => item.weight);
        break;
      case "head":
        idealDataPoints = idealData.map((item) => item.head_circumference_cm);
        realDataPoints = realData.map((item) => item.head_circumference);
        break;
      default:
        return;
    }

    const chartData = {
      labels: idealData.map((item) => `${item.age_months}M`),
      datasets: [
        {
          data: idealDataPoints,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: realDataPoints,
          color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    setActiveChart(type);
    setChartData(chartData);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>اختر الطفل الذي تريد أن ترى تمثيل قياساته</Text>
      {children.length === 0 ? (
        <Text style={styles.noData}>لا يوجد أطفال.</Text>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.value.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.childItem,
                selectedChild && selectedChild.value === item.value ? styles.selectedChild : null // إضافة التمييز عند الاختيار
              ]}
              onPress={() => handleChildSelect(item)}
            >
              <Text style={[
                styles.childText,
                selectedChild && selectedChild.value === item.value ? styles.selectedChildText : null // تغيير النص للون الأبيض عند الاختيار
              ]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedChild && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.chartButton, activeChart === "height" && styles.activeButton]}
            onPress={() => updateChartData(idealData, realData, "height")}
          >
            <Text style={styles.buttonText}> الطول </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartButton, activeChart === "weight" && styles.activeButton]}
            onPress={() => updateChartData(idealData, realData, "weight")}
          >
            <Text style={styles.buttonText}> الوزن </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartButton, activeChart === "head" && styles.activeButton]}
            onPress={() => updateChartData(idealData, realData, "head")}
          >
            <Text style={styles.buttonText}> محيط الرأس </Text>
          </TouchableOpacity>
        </View>
      )}

      {chartData && (
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={300}
          yAxisInterval={5}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#eaf6fc",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#007bff",
            },
          }}
          bezier
        />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#4e54c8",
  },
  noData: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    color: "#6c757d",
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

  selectedChild: {
    backgroundColor: "#7494ec", // اللون الجديد عند الاختيار
  },

  selectedChildText: {
    color: "#ffffff", // تغيير لون النص إلى الأبيض عند الاختيار
  },

  childText: {
   fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 16,
    justifyContent: "space-around",
  },
  chartButton: {
    backgroundColor: "#7494ec",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeButton: {
    backgroundColor: "#4e54c8",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
