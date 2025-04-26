import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import ipAdd from "C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // إضافة المكتبة للتدرج اللوني

const UnreadMomMessagesScreen = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState(null);
  const [activeEmail, setActiveEmail] = useState(null);
  const [message, setMessage] = useState("");
  const [intervalId, setIntervalId] = useState(null); // لحفظ معرّف الـ interval
  const flatListRef = useRef(); // المرجعية لـ FlatList

  // تحديث الرسائل الغير مقروءة عند تحميل المكون
  useEffect(() => {
    const fetchUnreadMomMessages = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const clinicId = decodedToken.clinic_id;

          const response = await axios.get(`${ipAdd}:8888/APIS/getAllMessages`, {
            params: { clinicId },
          });

          const filteredMessages = response.data.filter(
            (message) =>
              message.sender === "mom" &&
              !message.isRead &&
              Number(message.clinicId) === clinicId
          );
          
          setMessages(filteredMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUnreadMomMessages();

    // تحديث الرسائل كل 5 ثوانٍ
    const id = setInterval(fetchUnreadMomMessages, 5000);
    setIntervalId(id); // حفظ معرّف الـ interval

    return () => {
      // تنظيف الـ interval عند مغادرة الشاشة
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // لا تعتمد على `intervalId` هنا لتجنب التكرار اللانهائي

  const handleOpenChat = async (email) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const clinicId = decodedToken.clinic_id;

        await axios.post(`${ipAdd}:8888/APIS/updateMessageStatus`, {
          email,
          clinicId,
        });

        const response = await axios.get(`${ipAdd}:8888/APIS/getMessages`, {
          params: { email, clinicId },
        });

        setActiveEmail(email);
        const messagesArray = Object.values(response.data);
        if (messagesArray.length === 0) {
          setChatMessages([{ message: "ليس لديكم مسجات بعد، ابدأ بالمحادثة" }]);
        } else {
          setChatMessages(messagesArray);
        }

        // تحديث الرسائل
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.email !== email)
        );

        // بدء التحديث التلقائي للرسائل القديمة
        const id = setInterval(async () => {
          const response = await axios.get(`${ipAdd}:8888/APIS/getMessages`, {
            params: { email, clinicId },
          });

          const messagesArray = Object.values(response.data);
          setChatMessages(messagesArray);
          flatListRef.current?.scrollToEnd({ animated: true }); // التمرير التلقائي إلى آخر رسالة
        }, 5000); // تحديث كل 5 ثوانٍ

        setIntervalId(id); // حفظ معرّف الـ interval
      } catch (error) {
        console.error("Error handling chat opening:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!activeEmail || !message.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رسالة.");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const clinicId = decodedToken.clinic_id;

        await axios.post(`${ipAdd}:8888/APIS/sendMessage`, {
          email: activeEmail,
          clinicId,
          message,
          sender: "clinic",
        });

        setChatMessages((prevMessages) => [
          ...prevMessages,
          { message, sender: "clinic" },
        ]);

        setMessage(""); // إعادة تعيين الرسالة
        flatListRef.current?.scrollToEnd({ animated: true }); // التمرير التلقائي إلى آخر رسالة
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("خطأ", "فشل إرسال الرسالة.");
      }
    }
  };

  // تنظيف الـ interval عند الخروج من الشاشة أو غلق الشات
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  if (loading) {
    return <Text>جاري تحميل الرسائل...</Text>;
  }

  return (
    <LinearGradient colors={["#e2e2e2", "#c9d6ff"]} style={styles.container}> 
      {chatMessages === null ? (  // عند عرض الرسائل الغير مقروءة فقط
        <Text style={styles.header}>الرسائل</Text>
      ) : null}

      {chatMessages ? (
        // عرض الشات النشط
        <View style={styles.chatContainer}>
          <Text style={styles.chatHeader}>شات مع: {activeEmail}</Text>
          <FlatList
            ref={flatListRef} // ربط FlatList بالـ ref
            data={chatMessages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "clinic"
                    ? styles.clinicMessage
                    : styles.momMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "mom" && styles.momMessageText,
                  ]}
                >
                  {item.message}
                </Text>
              </View>
            )}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true }); // التمرير التلقائي عند تغيير المحتوى
            }}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="اكتب رسالتك هنا"
              placeholderTextColor="#A9A9A9"
              textAlign="right"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setChatMessages(null)} // العودة إلى قائمة الرسائل
          >
            <Text style={styles.backButtonText}>رجوع</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // عرض قائمة الرسائل
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.messageContainer}
              onPress={() => handleOpenChat(item.email)}
            >
              <Text style={styles.messageEmail}> {item.email}</Text>
              <Text style={styles.messageText2}> {item.message}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color:"#4e54c8"

  },
  chatContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  chatHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#7494ec",
    textAlign: "center"
  },
  messageContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  messageEmail: {
    fontWeight: "bold",  // الإيميل بالخط العريض
    color: "#6a5acd", // لون مميز للإيميل
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "70%",
  },
  clinicMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#7494ec",
  },
  momMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    color: "white",
  },
  messageText1: {
    color: "black",
  },
  messageText2:{
    color: "black",
textAlign:"right"
  },

  momMessageText: {
    color: "#7494ec",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#7494ec",
    borderRadius: 10,
  },
  backButton: {
    backgroundColor: "#7494ec",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default UnreadMomMessagesScreen;
