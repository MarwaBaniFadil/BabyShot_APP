import React, { useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import 'react-native-gesture-handler';
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true); // تفعيل دعم اللغة العربية
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import registerNNPushToken from 'native-notify';
import * as Notifications from 'expo-notifications';
import LoginScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/LoginScreen';
import HomeScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/HomeScreen';
import RegisterScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/RegisterScreen';
import WelcomeScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/WelcomeScreen';
import ForgotPasswordScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ForgotPasswordScreen';
import ResetPasswordScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ResetPasswordScreen';
import ClinicMap from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ClinicMap';
import AIchatScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/AIchatScreen';
import RegisterChildren from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/RegisterChildren';
import TimelineScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/TimelineScreen';
import VaccineDetailsScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/VaccineDetailsScreen';
import ChildBookletScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ChildBookletScreen';
import SideEffectScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/SideEffectScreen';
import CalculaterTochildScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/CalculaterTochildScreen';
import ChartsScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ChartsScreen';
import ChatGroupScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ChatGroupScreen';
import MomClinicChatScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/MomClinicChatScreen';
import MomClinicChatScreen1 from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/MomClinicChatScreen1';
import SchedulerScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/SchedulerScreen';
import FutureBookingsScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/FutureBookingsScreen';
import Sch from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/Sch';
import ParentProfileScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ParentProfileScreen';
import ConfirmScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ConfirmScreen';
import ChildDevelopmentDetailsScreen from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ChildDevelopmentDetailsScreen';
import AdminHome from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/AdminHome';
import DoctorHome from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/DoctorHome';
import ChildrenSection from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ChildrenSection';
import MothersSection from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/MothersSection';
import DoctorsSection from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/DoctorsSection';
import StatisticsSection from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/StatisticsSection';
import Admin_Notification from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/Admin_Notification';
import TimelineForAllChildren from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/TimelineForAllChildren';
import VaccineDoctor from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/VaccineDoctor';
import ChildBookletForAllChildren from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ChildBookletForAllChildren';
import FutureBookingsForDoctor from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/FutureBookingsForDoctor';
import ClinicChatPage from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ClinicChatPage';
import VaccineDetailsDoctor from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/VaccineDetailsDoctor';
import rating from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/rating';
import SchedulerScreenFromDoctor from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/SchedulerScreenFromDoctor';
import noti from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/noti';
import ratingD from 'C:/Users/ELIFE STORE/children_vaccination_clinic/screens/ratingD';



const Stack = createStackNavigator();

const Index = () => {
  const navigationRef = useRef();
 // registerNNPushToken(25374, 'CX0MkMyv3CEXCW6syuy0mD');
 registerNNPushToken(25739, '2aRpJy3CQV9MGRCroR0Qqk');


  useEffect(() => {
    // تسجيل التطبيق مع Native Notify

    // إعداد الإشعارات في Expo
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // التعامل مع الضغط على الإشعارات
    const handleNotificationPress = (response) => {
      const data = response.notification.request.content.data;
      console.log('بيانات الإشعار المستلمة:', data);

      // التحقق من وجود بيانات صالحة مع الإشعار
      if (data?.appointmentId && data?.parentId) {
        navigationRef.current?.navigate('Confirm', {
          appointmentId: data.appointmentId,
          parentId: data.parentId,
          childId: data.childId, // إضافة childId إلى params في التنقل
        });
      } else {
        Alert.alert('تنبيه', 'الإشعار لا يحتوي على بيانات صالحة.');
      }
    };

    // الاشتراك للاستماع إلى الرد على الإشعارات
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationPress
    );

    return () => subscription.remove(); // تنظيف الاشتراك عند التفكيك
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="welcome">
        <Stack.Screen name="welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Map" component={ClinicMap} />
        <Stack.Screen name="AI_Chat" component={AIchatScreen} />
        <Stack.Screen name="RegisterChildren" component={RegisterChildren} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="VaccineDetails" component={VaccineDetailsScreen} />
        <Stack.Screen name="ChildBooklet" component={ChildBookletScreen} />
        <Stack.Screen name="SideEffect" component={SideEffectScreen} />
        <Stack.Screen name="CalculaterTochild" component={CalculaterTochildScreen} />
        <Stack.Screen name="Charts" component={ChartsScreen} />
        <Stack.Screen name="chatGroup" component={ChatGroupScreen} />
        <Stack.Screen name="momTOclinic" component={MomClinicChatScreen} />
        <Stack.Screen name="momTOclinic1" component={MomClinicChatScreen1} />
        <Stack.Screen name="Scheduler" component={SchedulerScreen} />
        <Stack.Screen name="FutureBookings" component={FutureBookingsScreen} />
        <Stack.Screen name="Sch" component={Sch} />
        <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} />
        <Stack.Screen name="ChildDevelopmentDetails" component={ChildDevelopmentDetailsScreen} />
        <Stack.Screen name="AdminHome" component={AdminHome} />
        <Stack.Screen name="DoctorHome" component={DoctorHome} />
        <Stack.Screen name="ChildrenSection" component={ChildrenSection} />
        <Stack.Screen name="MothersSection" component={MothersSection} />
        <Stack.Screen name="DoctorsSection" component={DoctorsSection} />
        <Stack.Screen name="StatisticsSection" component={StatisticsSection} />
        <Stack.Screen name="AdminNotification" component={Admin_Notification} />
        <Stack.Screen name="TimelineForAllChildren" component={TimelineForAllChildren} />
        <Stack.Screen name="VaccineDoctor" component={VaccineDoctor} />
        <Stack.Screen name="ChildBookletForAllChildren" component={ChildBookletForAllChildren} />
        <Stack.Screen name="FutureBookingsForDoctor" component={FutureBookingsForDoctor} />
        <Stack.Screen name="ClinicChatPage" component={ClinicChatPage} />
        <Stack.Screen name="VaccineDetailsDoctor" component={VaccineDetailsDoctor} />
        <Stack.Screen name="rating" component={rating} />
        <Stack.Screen name="SchedulerScreenFromDoctor" component={SchedulerScreenFromDoctor} />
        <Stack.Screen name="noti" component={noti} />
        <Stack.Screen name="ratingD" component={ratingD} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Index;
