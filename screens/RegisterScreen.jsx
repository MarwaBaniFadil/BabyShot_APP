import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const RegisterScreen = ({ navigation }) => {
  const [momId, setMomId] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date()); // Set initial date
  const [bloodType, setBloodType] = useState(''); // Set initial blood type to empty
  const [childrenCount, setChildrenCount] = useState('');
  const [husbandName, setHusbandName] = useState('');
  const [husbandId, setHusbandId] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false); // State to show/hide DatePicker

  const handleRegister = async () => {
    if (!momId || !email || !password || !name || !birthDate || !bloodType || !childrenCount || !husbandName || !husbandId || !address || !contactNumber) {
      Alert.alert('خطأ', 'أدخل بياناتك بشكل كامل من فضلك!');
      return;
    }

    try {
      const response = await axios.post(`${ipAdd}:8888/APIS/register`, {
        momId,
        email,
        password,
        name,
        birthDate: birthDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        bloodType,
        childrenCount,
        husbandName,
        husbandId,
        address,
        contactNumber,
      });
      Alert.alert('Success', response.data.message);
      // Navigate to Login screen after successful registration
      navigation.navigate('Login'); 
    } catch (error) {
      Alert.alert('Error', error.response ? error.response.data.message : 'Registration failed.');
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  return (
    <LinearGradient colors={['#7494ec', '#4e54c8']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('C:/Users/ELIFE STORE/children_vaccination_clinic/images/motherhood.gif')} style={styles.icon} />
        <Text style={styles.title}>إنشاء حساب</Text>
        <View style={styles.formContainer}>

          {/** Fields */}
          {[ 
            { label: "رقم هوية الأم", value: momId, onChangeText: setMomId, keyboardType: "numeric" },
            { label: "البريد الإلكتروني", value: email, onChangeText: setEmail, keyboardType: "email-address" },
            { label: "كلمة المرور", value: password, onChangeText: setPassword, secureTextEntry: true },
            { label: "اسم الأم", value: name, onChangeText: setName },
            { label: "عدد الأطفال", value: childrenCount, onChangeText: setChildrenCount, keyboardType: "numeric" },
            { label: "اسم الزوج", value: husbandName, onChangeText: setHusbandName },
            { label: "رقم هوية الزوج", value: husbandId, onChangeText: setHusbandId, keyboardType: "numeric" },
            { label: "العنوان", value: address, onChangeText: setAddress },
            { label: "رقم الهاتف", value: contactNumber, onChangeText: setContactNumber, keyboardType: "phone-pad" },
          ].map((field, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                
                value={field.value}
                onChangeText={field.onChangeText}
                keyboardType={field.keyboardType}
                secureTextEntry={field.secureTextEntry}
              />
            </View>
          ))}

          {/** Birth Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>تاريخ الميلاد</Text>
            <TouchableOpacity onPress={showDatepicker} style={styles.input}>
              <Text style={{ color: '#333', fontSize: 16 }}>{birthDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={birthDate}
                mode="date"
                is24Hour={true}
                onChange={onChange}
              />
            )}
          </View>

          {/** Blood Type Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>فصيلة دم الأم</Text>
            <Picker
  selectedValue={bloodType}
  onValueChange={(itemValue) => setBloodType(itemValue)}
  style={styles.picker}
  itemStyle={{ color: '#4e54c8', fontSize: 16 }} // تعديل لون وحجم النص للخيارات
>
  <Picker.Item label="حدد فصيلة الدم" value="" style={{ color: '#888' }} />
  <Picker.Item label="A+" value="A+" style={{ color: '#000' }} />
  <Picker.Item label="A-" value="A-" style={{ color: '#000' }} />
  <Picker.Item label="B+" value="B+" style={{ color: '#000' }} />
  <Picker.Item label="B-" value="B-" style={{ color: '#000' }} />
  <Picker.Item label="AB+" value="AB+" style={{ color: '#000' }} />
  <Picker.Item label="AB-" value="AB-" style={{ color: '#000' }} />
  <Picker.Item label="O+" value="O+" style={{ color: '#000' }} />
  <Picker.Item label="O-" value="O-" style={{ color: '#000' }} />
</Picker>
          </View>

          {/** Register Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>تسجيل</Text>
          </TouchableOpacity>

          {/** Link to Login */}
          <View style={styles.loginContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>تسجيل الدخول</Text>
            </TouchableOpacity>
            <Text style={styles.loginText}>هل لديك حساب؟ </Text>
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#4e54c8',
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderColor: '#8f94fb',
    borderWidth: 1,
  },
  picker: {
    width: '100%',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    borderColor: '#8f94fb',
    borderWidth: 1,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#7494ec',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: 'row', // لإظهار الرابط على اليسار والسؤال على اليمين
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#000',
    fontSize: 16,
  },
  loginLink: {
    color: '#4e54c8',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginRight: 5, // لإضافة مسافة بين الرابط والسؤال
  },
});

export default RegisterScreen;