import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Slider from '@react-native-community/slider';

function CalculaterTochild() {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("أنثى");
  const [height, setHeight] = useState(70);
  const [weight, setWeight] = useState(12);
  const [headCircumference, setHeadCircumference] = useState(40);
  const [result, setResult] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const calculateAgeInMonths = useCallback((birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12;
    ageInMonths -= birth.getMonth();
    ageInMonths += today.getMonth();
    if (today.getDate() < birth.getDate()) {
      ageInMonths -= 1;
    }
    return ageInMonths;
  }, []);

  const getGrowthRanges = useCallback((age) => {
    let heightRange, weightRange, headCircumferenceRange;

    if (age >= 0 && age < 1) {
      heightRange = [45, 60];
      weightRange = [2.5, 4];
      headCircumferenceRange = [33, 37];
    } else if (age >= 1 && age < 3) {
      heightRange = [55, 65];
      weightRange = [4, 6];
      headCircumferenceRange = [37, 41];
    } else if (age >= 3 && age < 6) {
      heightRange = [60, 75];
      weightRange = [6, 11];
      headCircumferenceRange = [41, 46];
    } else if (age >= 6 && age < 10) {
      heightRange = [75, 85];
      weightRange = [10, 12];
      headCircumferenceRange = [46, 48];
    } else if (age >= 10 && age < 12) {
      heightRange = [80, 95];
      weightRange = [12, 15];
      headCircumferenceRange = [48, 50];
    } else if (age >= 12 && age < 18) {
      heightRange = [90, 100];
      weightRange = [14, 16];
      headCircumferenceRange = [50, 52];
    } else if (age >= 18 && age < 24) {
      heightRange = [95, 105];
      weightRange = [16, 18];
      headCircumferenceRange = [52, 54];
    } else if (age >= 24 && age < 36) {
      heightRange = [100, 110];
      weightRange = [18, 20];
      headCircumferenceRange = [54, 55];
    } else if (age >= 36 && age < 48) {
      heightRange = [105, 115];
      weightRange = [20, 22];
      headCircumferenceRange = [55, 56];
    } else if (age >= 48 && age < 60) {
      heightRange = [110, 120];
      weightRange = [22, 24];
      headCircumferenceRange = [55, 56];
    } else if (age >= 60 && age < 72) {
      heightRange = [115, 125];
      weightRange = [24, 26];
      headCircumferenceRange = [55, 57];
    } else if (age >= 72 && age < 84) {
      heightRange = [120, 130];
      weightRange = [26, 28];
      headCircumferenceRange = [56, 57];
    } else if (age >= 84 && age < 96) {
      heightRange = [125, 135];
      weightRange = [28, 30];
      headCircumferenceRange = [57, 58];
    } else if (age >= 96 && age < 108) {
      heightRange = [130, 140];
      weightRange = [30, 32];
      headCircumferenceRange = [58, 59];
    } else if (age >= 108 && age < 120) {
      heightRange = [135, 145];
      weightRange = [32, 35];
      headCircumferenceRange = [58, 59];
    } else if (age >= 120 && age < 132) {
      heightRange = [140, 150];
      weightRange = [35, 40];
      headCircumferenceRange = [59, 60];
    } else if (age >= 132 && age < 144) {
      heightRange = [145, 155];
      weightRange = [40, 45];
      headCircumferenceRange = [59, 60];
    } else if (age >= 144 && age < 156) {
      heightRange = [150, 160];
      weightRange = [45, 50];
      headCircumferenceRange = [60, 61];
    } else if (age >= 156 && age < 168) {
      heightRange = [155, 165];
      weightRange = [50, 55];
      headCircumferenceRange = [61, 62];
    } else {
      // Default values if age is out of range
      heightRange = [0, 0];
      weightRange = [0, 0];
      headCircumferenceRange = [0, 0];
    }

    return { heightRange, weightRange, headCircumferenceRange };
  }, []);

  const checkGrowth = () => {
    if (!birthDate) {
      setResult("يرجى إدخال تاريخ الولادة.");
      setIsModalVisible(true);
      return;
    }

    const ageInMonths = calculateAgeInMonths(birthDate);
    const { heightRange, weightRange, headCircumferenceRange } = getGrowthRanges(ageInMonths);

    let errorMessages = [];

    if (height < heightRange[0] || height > heightRange[1]) {
      errorMessages.push(`الطول غير مناسب ، يجب أن يكون بين ${heightRange[0]} و ${heightRange[1]} سم.`);
    }
    if (weight < weightRange[0] || weight > weightRange[1]) {
      errorMessages.push(`الوزن غير مناسب ، يجب أن يكون بين ${weightRange[0]} و ${weightRange[1]} كغ.`);
    }
    if (headCircumference < headCircumferenceRange[0] || headCircumference > headCircumferenceRange[1]) {
      errorMessages.push(`محيط الرأس غير مناسب ، يجب أن يكون بين ${headCircumferenceRange[0]} و ${headCircumferenceRange[1]} سم.`);
    }

    if (errorMessages.length === 0) {
      setResult("تهانينا! القيم ضمن النطاق الطبيعي للنمو.");
    } else {
      setResult(errorMessages.join(" \n"));
      setResult(errorMessages.join("\n----------------------------------------\n"));
    }

    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>حاسبة نمو الطفل</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>تاريخ الولادة</Text>
        <TextInput
          style={styles.input}
          value={birthDate}
          onChangeText={(text) => setBirthDate(text)}
          placeholder="YYYY-MM-DD"
          keyboardType="default"
          placeholderTextColor="#999999"
          
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>الجنس</Text>
        <View style={styles.genderButtons}>
          <Button title="أنثى" onPress={() => setGender("أنثى")} color={gender === "أنثى" ? "#4e54c8" : "#a6baef"} />
          <Button title="ذكر" onPress={() => setGender("ذكر")} color={gender === "ذكر" ? "#4e54c8" : "#a6baef"} />
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>طول الطفل (بالسنتيمترات)</Text>
        <Slider
          style={styles.slider}
          minimumValue={40}
          maximumValue={180}
          step={1}
          value={height}
          onValueChange={setHeight}
          minimumTrackTintColor="#7494ec"
          maximumTrackTintColor="white"
          thumbTintColor="#7494ec"
          thumbStyle={styles.thumb}
        />
        <Text>{height} سم</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>وزن الطفل (بالكيلوغرامات)</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={60}
          step={1}
          value={weight}
          onValueChange={setWeight}
          minimumTrackTintColor="#7494ec"
          maximumTrackTintColor="white"
          thumbTintColor="#7494ec"
          thumbStyle={styles.thumb}
        />
        <Text>{weight} كغ</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>محيط رأس الطفل (بالسنتيمتر)</Text>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={60}
          step={1}
          value={headCircumference}
          onValueChange={setHeadCircumference}
          minimumTrackTintColor="#7494ec"
          maximumTrackTintColor="white"
          thumbTintColor="#7494ec"
          thumbStyle={styles.thumb}
        />
        <Text>{headCircumference} سم</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={checkGrowth}>
        <Text style={styles.buttonText}>تحقق</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{result}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e6f0ff",
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "right",
    color: "#4e54c8",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#7494ec",
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  genderButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7494ec",
  },
  button: {
    backgroundColor: "#4e54c8",
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#4e54c8",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default CalculaterTochild;

