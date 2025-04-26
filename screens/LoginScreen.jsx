import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import jwtDecode from 'jwt-decode'; // مكتبة لفك التوكين
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceToken, setDeviceToken] = useState(null);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('خطأ', 'فشل الحصول على إذن الإشعارات.');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Device Token:', token);
      setDeviceToken(token);
    } else {
      Alert.alert('تنبيه', 'يجب استخدام جهاز حقيقي لتفعيل الإشعارات.');
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('الخطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      const response = await axios.post(`${ipAdd}:8888/APIS/login`, {
        email,
        password,
        deviceToken,
      });

      console.log(response.data);
      if (response.status === 200) {
        Alert.alert('نجاح', response.data.message);
        await AsyncStorage.setItem('token', response.data.token);

        // فك التوكين لاستخراج الدور
        const decodedToken = jwtDecode(response.data.token);
        const role = decodedToken.userRole;

        // توجيه المستخدم بناءً على دوره
        if (role === 'Parent') {
          navigation.navigate('Home');
        } else if (role === 'Admin') {
          navigation.navigate('AdminHome');
        } else if (role === 'Doctor') {
          navigation.navigate('DoctorHome');
        } else {
          Alert.alert('خطأ', 'دور غير معروف.');
        }
      }
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
      {/* منحنى علوي */}
      <Svg height="250" width="100%" style={styles.svgCurve}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#7494ec" stopOpacity="1" />
            <Stop offset="1" stopColor="#4e54c8" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path d="M0 80 Q140 150 300 80 T600 80 V250 H0 Z" fill="url(#grad)" />
      </Svg>

      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <Image
            source={require('C:/Users/ELIFE STORE/children_vaccination_clinic/images/user (1).png')}
            style={styles.userImage}
          />
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>هل نسيت كلمة السر؟</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>سجّل الان</Text>
          </TouchableOpacity>
          <Text style={styles.signupText}>هل أنت جديد هنا ؟</Text>
        </View>
      </View>
    </View>
  );
};

// نفس الـ Styles لديكِ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  svgCurve: {
    position: 'absolute',
    width: '100%',
    height: 250,
    top: 0,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 250,
    paddingHorizontal: 20,
  },
  iconContainer: {
    position: 'absolute',
    top: 160,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  userImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  inputsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#8f94fb',
    borderRadius: 10,
    color: '#000',
    fontSize: 16,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  forgotPassword: {
    color: '#8f94fb',
    fontSize: 14,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#7494ec',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    justifyContent: 'center',
  },
  signupText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 5,
  },
  signupLink: {
    color: '#4e54c8',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
