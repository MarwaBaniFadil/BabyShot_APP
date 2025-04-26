import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { MaterialIcons } from '@expo/vector-icons';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const ChildInfoScreen = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const { id: parentId } = jwt_decode(token);
        const response = await axios.get(
          `${ipAdd}:8888/APIS/getChildrenByParentId/${parentId}`
        );
        setChildren(response.data.users || []);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const fetchChildDetails = async (childId) => {
    try {
      const response = await axios.get(
        `${ipAdd}:8888/APIS/showallchildrenbyid/${childId}`
      );
      setSelectedChild(response.data.users[0]);
    } catch (err) {
      console.error('Error fetching child details:', err);
    }
  };

  if (loading) return <ActivityIndicator style={styles.loading} size="large" />;

  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {!selectedChild && (
  <Text style={styles.header}>اختر الطفل الذي تريد أن ترى معلوماته</Text>
)}
      {!selectedChild ? (
        <>
          <FlatList
            data={children}
            keyExtractor={(item) => item.child_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => fetchChildDetails(item.child_id)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Image
            source={require('C:/Users/ELIFE STORE/children_vaccination_clinic/images/babyyy.png')} // تأكد من وضع الصورة في مجلد assets
            style={styles.image}
          />
        </>
      ) : (
        <View style={styles.detailContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.gridContainer}>
              {/* البطاقة الأولى: هوية الطفل */}
              <Card
                style={[
                  styles.card,
                  {
                    backgroundColor: selectedChild.gender === 'ذكر' ? '#98b6e4' : '#f9e1e1',
                    borderColor: selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2',
                  },
                ]}
              >
                <Card.Content style={styles.cardContent}>
                  <MaterialIcons
                    name="help-outline"
                    size={40}
                    color={selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2'}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.cardTitle}>هوية الطفل</Text>
                  <View style={styles.cardDetails}>
                    <Paragraph style={styles.boldText}>الاسم: {selectedChild.name}</Paragraph>
                    <Paragraph style={styles.boldText}>
                      تاريخ الميلاد: {new Date(selectedChild.date_of_birth).toLocaleDateString()}
                    </Paragraph>
                    <Paragraph style={styles.boldText}>الجنس: {selectedChild.gender}</Paragraph>
                  </View>
                </Card.Content>
              </Card>

              {/* البطاقة الثانية: قياسات حالية */}
              <Card
                style={[
                  styles.card,
                  {
                    backgroundColor: selectedChild.gender === 'ذكر' ? '#98b6e4' : '#f9e1e1',
                    borderColor: selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2',
                  },
                ]}
              >
                <Card.Content style={styles.cardContent}>
                  <MaterialIcons
                    name="accessibility"
                    size={40}
                    color={selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2'}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.cardTitle}>قياسات حالية</Text>
                  <View style={styles.cardDetails}>
                    <Paragraph style={styles.boldText}>
                      الوزن الحالي: {selectedChild.current_weight} كغ
                    </Paragraph>
                    <Paragraph style={styles.boldText}>
                      الطول الحالي: {selectedChild.current_height} سم
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>

              {/* البطاقة الثالثة: قياسات الولادة */}
              <Card
                style={[
                  styles.card,
                  {
                    backgroundColor: selectedChild.gender === 'ذكر' ? '#98b6e4' : '#f9e1e1',
                    borderColor: selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2',
                  },
                ]}
              >
                <Card.Content style={styles.cardContent}>
                  <MaterialIcons
                    name="scale"
                    size={40}
                    color={selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2'}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.cardTitle}>قياسات الولادة</Text>
                  <View style={styles.cardDetails}>
                    <Paragraph style={styles.boldText}>
                      وزن الولادة: {selectedChild.birth_weight} كغ
                    </Paragraph>
                    <Paragraph style={styles.boldText}>
                      طول الولادة: {selectedChild.birth_height} سم
                    </Paragraph>
                    <Paragraph style={styles.boldText}>نوع الدم: {selectedChild.blood_type}</Paragraph>
                    <Paragraph style={styles.boldText}>
                      الحالة الطبية: {selectedChild.medical_conditions}
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>

              {/* البطاقة الرابعة: معلومات الولادة */}
              <Card
                style={[
                  styles.card,
                  {
                    backgroundColor: selectedChild.gender === 'ذكر' ? '#98b6e4' : '#f9e1e1',
                    borderColor: selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2',
                  },
                ]}
              >
                <Card.Content style={styles.cardContent}>
                  <MaterialIcons
                    name="location-on"
                    size={40}
                    color={selectedChild.gender === 'ذكر' ? '#4a6fb1' : '#ff85a2'}
                    style={styles.iconStyle}
                  />
                  <Text style={styles.cardTitle}>معلومات الولادة</Text>
                  <View style={styles.cardDetails}>
                    <Paragraph style={styles.boldText}>
                      مكان الولادة: {selectedChild.birth_place}
                    </Paragraph>
                    <Paragraph style={styles.boldText}>
                      المستشفى: {selectedChild.birth_hospital}
                    </Paragraph>
                    <Paragraph style={styles.boldText}>
                      نوع الولادة: {selectedChild.birth_type}
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <Button
              mode="outlined"
              onPress={() => setSelectedChild(null)}
              style={styles.backButton}
            >
              العودة إلى القائمة
            </Button>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#e6f0ff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  listItem: {
    padding: 18,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#7494ec',
  },
  listItemText: { fontSize: 18, color: '#333', fontWeight: '600', textAlign: 'center' },
  detailContainer: { flex: 1 },
  scrollContainer: { paddingBottom: 20 },
  gridContainer: { marginTop:20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    height: 250,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
  },
  cardContent: { alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  boldText: { fontWeight: 'bold', textAlign: 'right' },
  iconStyle: { marginBottom: 10 },
  backButton: { marginTop: 20, alignSelf: 'center' },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#4e54c8",
  },
});

export default ChildInfoScreen;
