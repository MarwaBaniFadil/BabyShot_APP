import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import axios from "axios";
import jwt_decode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';

 const App = ({ navigation }) => {
  const ageMapping = {
    "month0": "حديث الولادة",
    "month1": "الشهر الأول",
    "month2": "الشهر الثاني",
    "month4": "الشهر الرابع",
    "month6": "الشهر السادس",
    "month12": "الشهر الثاني عشر",
    "month18": "الشهر الثامن عشر",
    "year6": "السنة السادسة",
    "year15": "السنة الخامسة عشر",
  };

  const [showOverlay, setShowOverlay] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [childVaccines, setChildVaccines] = useState({});
  const [showNextAgeOverlay, setShowNextAgeOverlay] = useState(false);
  const [nextAge, setNextAge] = useState(null);
  const [nextVaccineDate, setNextVaccineDate] = useState(null);

  useEffect(() => {
  

  }, []);



  const handleBoxClick = async (info) => {
    const vaccineList = info.split("\n");
    setVaccines(vaccineList);
    setShowOverlay(true);
    setShowNextAgeOverlay(false); // إغلاق نافذة العمر التالي
  };

  const handleVaccineClick = async (vaccineName) => {
    try {
      const response = await axios.get(
        `${ipAdd}:8888/APIS/showallvaccinesbyname/${vaccineName}`
      );
      const vaccineData = response.data.users && response.data.users[0];
      setSelectedVaccine(vaccineData);
      console.log(`تفاصيل الطعم: ${vaccineName}`, vaccineData);
    } catch (error) {
      console.error("حدث خطأ أثناء جلب تفاصيل الطعم:", error);
    }
  };


  const divs = [
    {
      key: "month2",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z3.png"),
      title: "الشهر الثاني",
      info: "Penta vaccine\nIPV\nPCV\nOPV\nRotavac",
    },
    {
      key: "month1",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z2.png"),
      title: "الشهر الأول",
      info: "IPV",
    },
    {
      key: "month0",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z1.png"),
      title: "حديث الولادة",
      info: "BCG\nHep.B",
    },
    {
      key: "month12",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z6.png"),
      title: "الشهر الثاني عشر",
      info: "MMR\nPCV",
    },
    {
      key: "month6",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z5.png"),
      title: "الشهر السادس",
      info: "Penta vaccine\nRotavac\nOPV",
    },
    {
      key: "month4",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z4.png"),
      title: "الشهر الرابع",
      info: "Penta vaccine\nPCV\nOPV\nRotavac",
    },
    {
      key: "year15",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z9.png"),
      title: "السنة الخامسة عشر",
      info: "Td",
    },
    {
      key: "year6",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z8.png"),
      title: "السنة السادسة",
      info: "OPV\nDT",
    },
    {
      key: "month18",
      image: require("C:/Users/ELIFE STORE/children_vaccination_clinic/images/z7.png"),
      title: "الشهر الثامن عشر",
      info: "MMR\nDPT\nOPV",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.curveContainer}>
        <View style={styles.curve}></View>
        <Text style={styles.sectionTitle}>البرنامج الوطني الموسّع للتطعيم في فلسطين</Text>
      </View>
      <View style={styles.imagesContainer}>
        {divs.map((div, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageBox}
            onPress={() => handleBoxClick(div.info)}
          >
            <Image source={div.image} style={styles.image} />
            <Text style={styles.boldText}>{div.title}</Text>
            <Text style={styles.infoText}>{div.info}</Text>
            {childVaccines[div.key] === 1 && (
              <Text style={styles.checkIcon}>✔️</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {showOverlay && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowOverlay(false);
              setSelectedVaccine(null);
            }}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.overlayContent}>
            {selectedVaccine ? (
               <View>
               <Text style={[styles.boldText, styles.title]}> {selectedVaccine.name}</Text>
               <Text style={styles.textRight}><Text style={styles.boldText1}>الفئة العمرية :  </Text>{selectedVaccine.age_group}</Text>
               <Text style={styles.textRight}><Text style={styles.boldText1}>طريقة إعطاء اللقاح :  </Text>{selectedVaccine.delivery_method}</Text>
               <Text style={styles.textRight}><Text style={styles.boldText1}>الوصف :  </Text>{selectedVaccine.description}</Text>
               <Text style={styles.textRight}><Text style={styles.boldText1} >الجرعة :  </Text>{selectedVaccine.dosage_amount}</Text>
               <Text style={styles.textRight}><Text style={styles.boldText1}>الآثار الجانبية :  </Text>{selectedVaccine.side_effects}</Text>
             </View>
            ) : (
              vaccines.map((vaccine, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.vaccineButton}
                  onPress={() => handleVaccineClick(vaccine)}
                >
                  <Text style={styles.vaccineButtonText}>{vaccine}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      )}

{showNextAgeOverlay && (
  <View style={styles.overlay}>
    <TouchableOpacity
      style={styles.closeButton}
      onPress={() => {
        setShowNextAgeOverlay(false);
        setNextAge(null);
        setNextVaccineDate(null);
      }}
    >
      <Text style={styles.closeButtonText}>X</Text>
    </TouchableOpacity>
    <View style={styles.overlayContent}>
      {nextAge || nextVaccineDate ? (
        <>
          <View style={styles.nextVaccineContainer}>
          <Text style={styles.nextVaccineDetail}> {nextAge}</Text>
            <Text style={[styles.boldText, styles.nextVaccineText]}>
                الطعم القادم :
            </Text>
            
          </View>
          <View style={styles.nextVaccineContainer}>
          <Text style={styles.nextVaccineDetail}>{nextVaccineDate} </Text>
            <Text style={[styles.boldText, styles.nextVaccineText]}>
              الموعد المُقترَح : 
            </Text>
            
          </View>
         
        </>
      ) : (
        <Text>لا توجد بيانات للعمر أو التاريخ القادم.</Text>
      )}
    </View>
  </View>
)}



    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 0,
    width: '100%',
  },
  imageBox: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d4d4d4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    margin: '1.5%',
  },
  image: {
    width: '50%',
    height: 60,
    borderRadius: 8,
    marginBottom: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  overlayContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  vaccineButton: {
    backgroundColor: "#7494ec",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  vaccineButtonText: {
    color: "white",
  },
  boldText: {
    fontWeight: "bold",
  },
  title: {
    fontSize: 26,
    marginBottom:15,
    textAlign:'center',
  },
  textRight: {
    textAlign: 'right',
    fontSize: 16,
    marginVertical: 5,
  },
  selectedChildText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  childrenContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  childButton: {
    backgroundColor: '#7494ec',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  childButtonText: {
    color: "white",
  },
  checkIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "#28a745", // خلفية خضراء
    borderRadius: 50, // لجعل الشكل دائريًا
    padding: 5, // المسافة بين الأيقونة وحواف الدائرة
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -30,
    textAlign: 'center',
    zIndex: 1,
  },
  curveContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#7494ec',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    marginBottom: 30,
    position: 'relative',
  },
  curve: {
    height: 50,
    backgroundColor: '#7494ec',
    borderRadius: 50,
    marginTop: 20,
  },
  infoText: {
    color: '#808080', // اللون الرمادي
    textAlign: 'center',
  },
  nextVaccineContainer: {
    flexDirection: 'row',  // لضبط النصوص جنب بعض
    justifyContent: 'flex-start', // لضبط المحاذاة
    width: '100%',  // لتوسيع الحاوية بالكامل
    marginVertical: 10, // إضافة مسافة بين الأسطر
  },
  
  nextVaccineText: {
    fontWeight: 'bold', // الخط العريض
    fontSize: 16,
    marginRight: 5, // مسافة بين العنوان والقيمة
  },

  nextVaccineDetail: {
    fontSize: 16,
    flexShrink: 1,  // لتجنب تجاوز النص
  },
  
  bookAppointmentText: {
    color: 'blue',
    fontSize: 14,
    marginTop:10,
  },
  boldText1: {
    fontWeight:"bold",
    color:'#4e54c8',
  },
});

export default App;
