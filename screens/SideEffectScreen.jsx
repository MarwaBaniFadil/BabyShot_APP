import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const VaccineSideEffects = () => {
  const [vaccine, setVaccine] = useState('');
  const [disease, setDisease] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSideEffects('');

    try {
      const response = await axios.post(`${ipAdd}:8888/APIS/chat`, {
        disease: disease,
        vaccine: vaccine,
      });
      const cleanedText = response.data.text.replace(/[#*]/g, '');
      setSideEffects(cleanedText);
      setIsModalOpen(true);
    } catch (err) {
      setError('حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الآثار الجانبية للقاحات حسب مرض طفلك</Text>

      <Image source={require('../images/sidee.png')} style={styles.image} />

      <Text style={styles.description}>
      تساعدك هذه الصفحة في التعرف على الأعراض الجانبية المحتملة للقاحات بناءً على حالة طفلك الصحية.
      </Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسم الطعم هنا"
           textAlign='right'
          placeholderTextColor="#999999"
          value={vaccine}
          onChangeText={(text) => setVaccine(text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder=" أدخل اسم المرض الذي يعاني منه طفلك حالياً هنا"
          placeholderTextColor="#999999"
          textAlign='right'
          value={disease}
          onChangeText={(text) => setDisease(text)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>بحث</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>الآثار الجانبية</Text>
            <Text style={styles.modalText}>{sideEffects}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e6f0ff',
  },
  title: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15, // زوايا دائرية أكبر
    padding: 12, // مساحة padding أكبر
    backgroundColor: '#fff',
    fontSize: 16, // حجم الخط
    fontFamily: 'Arial', // نوع الخط
    color: '#333', // لون النص
    shadowColor: '#000', // لون الظل
    shadowOffset: { width: 0, height: 4 }, // توجيه الظل
    shadowOpacity: 0.1, // شفافية الظل
    shadowRadius: 6, // حجم الظل
    elevation: 5, // تأثير الظل على الأجهزة التي تدعم ذلك (مثل Android)
    paddingHorizontal: 15, // تباعد أكبر على الجانبين
    marginBottom: 15, // مسافة أسفل الحقل
  },
  button: {
    backgroundColor: '#7494ec',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#7494ec",
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#000',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VaccineSideEffects;


