import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import { LinearGradient } from 'expo-linear-gradient';



const App = () => {
  const [clinic, setClinic] = useState(null);
  const [comments, setComments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
      } else {
        try {
          const decodedToken = jwtDecode(token);
          const userRole = decodedToken.userRole;

          if (userRole !== 'Admin') {
            navigation.navigate('Login');
          } else {
            const clinicId = decodedToken.clinic_id;
            fetchClinicDetails(clinicId);
            fetchComments(clinicId);
          }
        } catch (error) {
          console.error('Invalid token:', error);
          navigation.navigate('Login');
        }
      }
    };

    fetchData();
  }, [navigation]);

  const clinicLinks = [
    { id: 19, url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGYGSQCH8Xt4jxU1B5iaGXPL4wON4KcB9IdEtjesLjH7R97GjKnBtxHVEw2g75LCMQ8UNVk1EsBqEJ/pubhtml?gid=234778037&single=true', name: 'راس العين' },
    { id: 17, url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGYGSQCH8Xt4jxU1B5iaGXPL4wON4KcB9IdEtjesLjH7R97GjKnBtxHVEw2g75LCMQ8UNVk1EsBqEJ/pubhtml?gid=258012577&single=true', name: 'وكالة الغوث - بلاطة' },
    { id: 16, url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGYGSQCH8Xt4jxU1B5iaGXPL4wON4KcB9IdEtjesLjH7R97GjKnBtxHVEw2g75LCMQ8UNVk1EsBqEJ/pubhtml?gid=2106231747&single=true', name: 'مديرية الصحة - المخفية' },
    { id: 18, url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGYGSQCH8Xt4jxU1B5iaGXPL4wON4KcB9IdEtjesLjH7R97GjKnBtxHVEw2g75LCMQ8UNVk1EsBqEJ/pubhtml?gid=2098737&single=true', name: 'وكالة الغوث - مخيم العين' },
  ];

  const fetchClinicDetails = (clinicId) => {
    axios.get(`${ipAdd}:8888/APIS/showallclincName`)
      .then((response) => {
        const clinicData = response.data.clinics.find(clinic => clinic.clinic_id === clinicId);
        setClinic(clinicData);
      })
      .catch((error) => console.error('Error fetching clinic details:', error));
  };

  const fetchComments = (clinicId) => {
    axios.get(`${ipAdd}:8888/APIS/getComments/${clinicId}`)
      .then((response) => setComments(response.data.comments))
      .catch((error) => console.error('Error fetching comments:', error));
  };

  return (
      <LinearGradient colors={["#e2e2e2", "#c9d6ff"]} style={styles.container}>
      {clinic ? (
        <View style={styles.wrapper}>
          <Text style={styles.title}>{clinic.name}</Text>
          <View style={styles.clinicDetails}>
            <Text>
              متوسط التقييم: 
              {clinic.badge !== undefined && clinic.badge !== null
                ? `${clinic.badge.toFixed(1)} / 5`
                : 'لم يتم تقييم هذه العيادة بعد.'}
            </Text>
            <View style={styles.starsWrapper}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome
                  key={i}
                  name="star"
                  size={16}
                  color={i < clinic.badge ? '#FFD700' : '#ccc'}
                />
              ))}
            </View>
            {clinicLinks
              .filter(link => link.id === clinic.clinic_id)
              .map(link => (
                <TouchableOpacity
                  key={link.id}
                  onPress={() => Linking.openURL(link.url)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>افتح جوجل شيت لترى اجوبة الاستطلاع </Text>
                </TouchableOpacity>
              ))}
          </View>
          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>التعليقات</Text>
            {comments.length > 0 ? (
              <FlatList
                data={comments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.comment}>
      <Text style={styles.commentText}>{item.comment}</Text>
      </View>
                )}
              />
            ) : (
              <Text>لا توجد تعليقات بعد.</Text>
            )}
          </View>
        </View>
      ) : (
        <Text>جاري تحميل بيانات العيادة...</Text>
      )}
      
 </LinearGradient>    
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e6f0ff',
  },
  wrapper: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign:"center",
    color:"#7494ec"
  },
  clinicDetails: {
    marginBottom: 20,
    alignItems:"center"
  },
  starsWrapper: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#7494ec',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight:"bold"
  },
  commentSection: {
    marginTop: 20,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:"center"

  },
  comment: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    textAlign:"center"
  },
  commentText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center", // محاذاة النص في المنتصف
  },
});

export default App;
