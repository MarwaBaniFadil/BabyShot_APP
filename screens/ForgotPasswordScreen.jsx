import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handlePasswordResetRequest = async () => {
    console.log('محاولة إرسال طلب إعادة تعيين كلمة المرور');
    if (!email) {
        Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني.');
        return;
    }

    try {
        const response = await axios.post('http://192.168.5.196:8888/APIS/request-password-reset', {
            email,
        });
        console.log('تم تلقي استجابة:', response.data);
        Alert.alert('نجاح', 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
        navigation.navigate('ResetPassword'); // توجيه المستخدم إلى شاشة إعادة تعيين كلمة المرور
    } catch (error) {
        if (error.response) {
            Alert.alert('خطأ', `حدث خطأ: ${error.response.data.message}`);
        } else if (error.request) {
            Alert.alert('خطأ', 'لم يتم تلقي أي رد من الخادم.');
        } else {
            Alert.alert('خطأ', 'حدث خطأ في الاتصال بالخادم: ' + error.message);
        }
    }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>استعادة كلمة المرور</Text>
      <TextInput
        style={styles.input}
        placeholder="أدخل بريدك الإلكتروني"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button}   onPress={handlePasswordResetRequest}>
        <Text style={styles.buttonText}>طلب إعادة تعيين كلمة المرور</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#8f94fb',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#4e54c8',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
