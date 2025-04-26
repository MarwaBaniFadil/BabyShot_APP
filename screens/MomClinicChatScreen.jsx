// ClinicSelectionScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from "axios";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';

const ClinicSelectionScreen = ({ navigation }) => {
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    axios.get(`${ipAdd}:8888/APIS/clinics`)
      .then((response) => setClinics(response.data.clinics || []))
      .catch((error) => console.error("Error fetching clinics:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>اختر عيادة</Text>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.clinic_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clinicButton}
            onPress={() => navigation.navigate("momTOclinic1", { clinicId: item.clinic_id })}
          >
            <Text style={styles.clinicButtonText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"#e6f0ff"
  },
  header: {
    marginTop: 80,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  clinicButton: {
    backgroundColor: '#7494ec',
    paddingVertical: 15,
    paddingHorizontal: 25,
    margin: 10,
    borderRadius: 25,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
    
    transform: [{ scale: 1 }], // تأثير الضغط مع انحناء بسيط
    transition: 'all 0.2s ease-in-out', // تأثير سلس عند الضغط
    width: "100%",
    marginRight: 40,
    marginLeft: 0,
    borderWidth: 0, // إزالة الحدود التي قد تسبب الخط
  },
  clinicButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});

export default ClinicSelectionScreen;
