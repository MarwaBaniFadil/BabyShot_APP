import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Linking
} from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const App = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    axios
      .get(`${ipAdd}:8888/APIS/showallclincName`)
      .then((response) => setClinics(response.data.clinics))
      .catch((error) => console.error('Error fetching clinics:', error));
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      axios
        .get(`${ipAdd}:8888/APIS/getComments/${selectedClinic.clinic_id}`)
        .then((response) => setComments(response.data.comments))
        .catch((error) => console.error('Error fetching comments:', error));
    }
  }, [selectedClinic]);

  const handleRatingSubmit = () => {
    if (rating === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار تقييم!');
      return;
    }

    axios
      .post(`${ipAdd}:8888/APIS/addRating`, {
        clinic_id: selectedClinic.clinic_id,
        rating: rating,
        comment: newComment,
      })
      .then(() => {
        Alert.alert('نجاح', 'تم إرسال التقييم بنجاح');
        setSelectedClinic(null);
        setRating(0);
        setNewComment('');
        axios
          .get(`${ipAdd}:8888/APIS/showallclincName`)
          .then((response) => setClinics(response.data.clinics))
          .catch((error) => console.error('Error fetching clinics:', error));
      })
      .catch((error) => console.error('Error submitting rating:', error));
  };

  const renderClinic = ({ item }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() => setSelectedClinic(item)}
    >
      <Text style={styles.clinicName}>{item.name}</Text>
      <Text style={styles.clinicInfo}>الموقع: {item.address}</Text>
      <Text style={styles.clinicInfo}>رقم التواصل: {item.contact_number}</Text>
      <Text style={styles.clinicInfo}>ساعات الدوام: 8 صباحاً - 2 ظهراً</Text>
      <View style={styles.starsWrapper}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FontAwesome
            key={i}
            name="star"
            size={16}
            color={i < item.badge ? '#FFD700' : '#ccc'}
          />
        ))}
      </View>
      <Text style={styles.averageRating}>تقييم: {item.badge}/5</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تقييم العيادات</Text>
      <FlatList
  data={clinics}
  keyExtractor={(item) => item.clinic_id.toString()}
  renderItem={renderClinic}
  contentContainerStyle={styles.clinicList}
  numColumns={1} // جعل الأعمدة 1 لكل صف
/>



      {selectedClinic && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedClinic.name}</Text>
              <Text style={styles.modalSubtitle}>
                متوسط التقييم: {selectedClinic.badge.toFixed(1)} / 5
              </Text>
              <View style={styles.ratingStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FontAwesome
                    key={i}
                    name="star"
                    size={32}
                    color={i < rating ? '#FFD700' : '#ccc'}
                    onPress={() => setRating(i + 1)}
                  />
                ))}
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="اكتب تعليقك هنا..."
                value={newComment}
                onChangeText={(text) => setNewComment(text)}
                multiline={true}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRatingSubmit}
              >
                <Text style={styles.buttonText}>إرسال التقييم</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedClinic(null)}
              >
                <Text style={styles.buttonText}>إغلاق</Text>
              </TouchableOpacity>
              <ScrollView>
                <Text style={styles.commentsTitle}>التعليقات</Text>
                {comments.map((comment, index) => (
                  <Text key={index} style={styles.comment}>
                    {comment.comment}
                  </Text>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
        {/* زر الاستطلاع */}
  <TouchableOpacity
    style={styles.surveyButton}
    onPress={() =>
      Linking.openURL(
        'https://docs.google.com/forms/d/e/1FAIpQLSe-nOCdXdcRnnplXVhPyXLFemXZdMalLsIrRwepHJ8m6Vx_Zw/viewform?fbzx=5748064710820425051'
      )
    }
  >
    <Text style={styles.surveyButtonText}>لإضافة استطلاع عن إحدى العيادات</Text>
  </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f0ff', padding: 16 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  clinicList: { justifyContent: 'space-between' },
  clinicCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8, // تعديل الفاصل العمودي بين البطاقات
    marginHorizontal: 16, // تعديل الفاصل الأفقي من حواف الشاشة
    width: '90%', // عرض البطاقة يأخذ العرض الكامل
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e54c8',
    marginBottom: 8,
    textAlign: 'center',
  },
  clinicInfo: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  starsWrapper: {
    flexDirection: 'row',
    marginTop: 10,
  },
  averageRating: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // خلفية داكنة شفافة
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10, // ارتفاع الظلال
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4e54c8',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight:"bold"
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submitButton: {
    backgroundColor: '#7494ec',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4e54c8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButton: {
    backgroundColor: '#970e0e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ff5252',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4e54c8',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  comment: {
    fontSize: 14,
    color: '#555',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 8,
    textAlign: 'right',

  },
  surveyButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4e54c8',
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  surveyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
