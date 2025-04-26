import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ResetPasswordScreen = ({ navigation }) => {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordReset = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      Alert.alert('خطأ', 'يرجى إدخال جميع الحقول.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.5.196:8888/APIS/reset-password', {
        resetCode,
        newPassword,
      });
      Alert.alert('نجاح', 'تم إعادة تعيين كلمة المرور بنجاح.');
      navigation.navigate('Login'); // الرجوع إلى شاشة تسجيل الدخول بعد نجاح التغيير
    } catch (error) {
      if (error.response) {
        Alert.alert('خطأ', error.response.data.message);
      } else {
        Alert.alert('خطأ', 'حدث خطأ في الاتصال بالخادم.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إعادة تعيين كلمة المرور</Text>

      <TextInput
        style={styles.input}
        placeholder="أدخل رمز التحقق"
        placeholderTextColor="#ccc"
        value={resetCode}
        onChangeText={setResetCode}
      />

      <TextInput
        style={styles.input}
        placeholder="أدخل كلمة المرور الجديدة"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="تأكيد كلمة المرور الجديدة"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>إعادة تعيين كلمة المرور</Text>
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

export default ResetPasswordScreen;
