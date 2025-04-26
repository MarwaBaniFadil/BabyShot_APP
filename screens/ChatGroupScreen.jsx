import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import { LinearGradient } from 'expo-linear-gradient';



const ChatApp = ({ navigation }) => {
  const ageGroups = [
    "حديث الولادة",
    "شهر",
    "شهرين",
    "اربعة شهور",
    "ستة شهور",
    "سنة",
    "سنة ونصف",
    "ستة سنين",
    "خمسة عشر سنة",
  ];

  const [joinedGroups, setJoinedGroups] = useState({});
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [messages, setMessages] = useState([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [repliedMessage, setRepliedMessage] = useState(null);


  // استخراج بيانات التوكن من AsyncStorage
  const getTokenData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
    return null;
  };

  // تحميل حالة الجروبات المنضمة عند تحميل الصفحة
  const loadJoinedGroups = async () => {
    const tokenData = await getTokenData();
    if (tokenData) {
      const email = tokenData.email; // استخدام البريد الإلكتروني لتخزين الجروبات بشكل منفصل
      const savedGroups = await AsyncStorage.getItem(`joinedGroups_${email}`);
      if (savedGroups) {
        setJoinedGroups(JSON.parse(savedGroups));
      }
    }
  };

  // تحميل الرسائل عند العودة إلى نفس الجروب
  const loadMessages = async (ageGroup) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/getMessagesbyage?ageGroup=${ageGroup}`);
      if (response.status === 200 && response.data) {
        const messagesArray = Object.values(response.data).map((msg) => ({
          ...msg,
          timestamp: new Date(parseInt(msg.timestamp)).toLocaleString(),
        }));
        setMessages(messagesArray);
        // إذا كنت تريد الاحتفاظ بنسخة في AsyncStorage
        await AsyncStorage.setItem(`messages_${ageGroup}`, JSON.stringify(messagesArray));
      } else {
        setMessages([]); // في حال عدم وجود بيانات
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("خطأ", "خطأ في تحميل الرسائل من الخادم!");
    }
  };
  useEffect(() => {
    if (selectedAgeGroup) {
      loadMessages(selectedAgeGroup); // تحميل الرسائل أولاً
    }
  }, [selectedAgeGroup]);
  
  // تأكد من التمرير لأسفل عند تغيير الرسائل
  useEffect(() => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  }, [messages]); // عندما تتغير الرسائل
  
  
  // تحديث الرسائل كل 5 ثوانٍ
useEffect(() => {
  if (selectedAgeGroup) {
    const interval = setInterval(() => {
      loadMessages(selectedAgeGroup);
    }, 20000);

    return () => clearInterval(interval); // تنظيف التايمر عند تغيير المجموعة أو الخروج منها
  }
}, [selectedAgeGroup]);


  // الحصول على البريد الإلكتروني عند تحميل الصفحة
  useEffect(() => {
    (async () => {
      const tokenData = await getTokenData();
      if (tokenData) {
        setEmail(tokenData.email);
      }
      await loadJoinedGroups();
    })();
  }, []);

  const handleJoinGroup = async (ageGroup) => {
    const tokenData = await getTokenData();
    if (tokenData) {
      const email = tokenData.email; // استخدام البريد الإلكتروني لتخزين الجروبات بشكل منفصل
      const updatedGroups = { ...joinedGroups, [ageGroup]: true };
      setJoinedGroups(updatedGroups);
      await AsyncStorage.setItem(`joinedGroups_${email}`, JSON.stringify(updatedGroups)); // حفظ الجروبات مع البريد الإلكتروني
      Alert.alert("تم الانضمام", `تم الانضمام إلى مجموعة ${ageGroup}`);
    }
  };

  const handleOpenChat = (ageGroup) => {
    setSelectedAgeGroup(ageGroup);
    loadMessages(ageGroup);
  };

// تعديل handleSendMessage
const handleSendMessage = () => {
  if (!message.trim()) {
    Alert.alert("تنبيه", "يرجى كتابة رسالة.");
    return;
  }

  const newMessage = {
    ageGroup: selectedAgeGroup,
    message,
    sender: email,
    replyTo: repliedMessage ? { sender: repliedMessage.sender, message: repliedMessage.message } : null,
  };

  axios
    .post(`${ipAdd}:8888/APIS/sendMessagebyage`, newMessage, {
      headers: { "Content-Type": "application/json" },
    })
    .then((response) => {
      if (response.data === "Message sent successfully!") {
        const updatedMessages = [
          ...messages,
          { ...newMessage, timestamp: new Date().toLocaleString() },
        ];
        setMessages(updatedMessages);
        AsyncStorage.setItem(`messages_${selectedAgeGroup}`, JSON.stringify(updatedMessages));
        setMessage("");
        setRepliedMessage(null); // إعادة تعيين الرسالة المُراد الرد عليها
        messagesEndRef.current?.scrollToEnd({ animated: true });
      } else {
        Alert.alert("خطأ", "فشل في إرسال الرسالة! الرد غير متوقع من الخادم.");
      }
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      Alert.alert("خطأ", "خطأ في إرسال الرسالة!");
    });
};


  const handleLeaveGroup = () => {
    Alert.alert("تأكيد", "هل أنت متأكد أنك تريد مغادرة هذه المجموعة؟", [
      {
        text: "إلغاء",
      },
      {
        text: "مغادرة",
        onPress: async () => {
          const tokenData = await getTokenData();
          if (tokenData) {
            const email = tokenData.email; // استخدام البريد الإلكتروني لتخزين الجروبات بشكل منفصل
            const updatedGroups = { ...joinedGroups };
            delete updatedGroups[selectedAgeGroup];
            setJoinedGroups(updatedGroups);
            await AsyncStorage.setItem(`joinedGroups_${email}`, JSON.stringify(updatedGroups)); // حفظ الجروبات مع البريد الإلكتروني
            setSelectedAgeGroup("");
            Alert.alert("تمت المغادرة", `تمت مغادرة مجموعة ${selectedAgeGroup}`);
          }
        },
      },
    ]);
  };

  const renderChatScreen = () => (
    <LinearGradient
      colors={["#e2e2e2", "#c9d6ff"]}
      style={styles.chatContainer}
    >
<ScrollView
  style={styles.messagesContainer}
  ref={messagesEndRef}
  onContentSizeChange={() => messagesEndRef.current?.scrollToEnd({ animated: true })}
>
  {messages.length ? (
    messages.map((msg, index) => (
      <View
        key={index}
        style={[
          styles.message,
          msg.sender === email ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {/* عرض الرسالة التي يتم الرد عليها إذا وجدت */}
        {msg.replyTo && (
          <View style={styles.repliedMessageBox}>
            <Text style={styles.replyToSender}>{msg.replyTo.sender}</Text>
            <Text style={styles.replyToMessage}>{msg.replyTo.message}</Text>
          </View>
        )}

        {/* عرض اسم المرسل إن لم يكن المستخدم نفسه */}
        {msg.sender !== email && <Text style={styles.sender}>{msg.sender}</Text>}

        {/* عرض نص الرسالة */}
        <Text
          style={[
            styles.messageText,
            msg.sender === email ? styles.myMessageText : null,
          ]}
        >
          {msg.message}
        </Text>

        {/* عرض الطابع الزمني */}
        <Text style={styles.timestamp}>{msg.timestamp}</Text>

        {/* زر الرد */}
        {msg.sender !== email && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() =>
              setRepliedMessage({
                sender: msg.sender,
                message: msg.message,
              })
            }
          >
            <MaterialIcons name="reply" size={16} color="#7494ec" />
            <Text style={styles.replyText}>ردّ</Text>
          </TouchableOpacity>
        )}
      </View>
    ))
  ) : (
    <Text style={styles.noMessages}>لا توجد رسائل لهذه المجموعة.</Text>
  )}
</ScrollView>


  
<View style={styles.inputContainer}>
  {/* زر العودة إلى المجموعات */}
  <TouchableOpacity style={styles.backToGroupsButton} onPress={() => setSelectedAgeGroup("")}>
    <MaterialIcons name="arrow-back" size={24} color="black" />
  </TouchableOpacity>

  {/* عرض مربع الرد */}
  {repliedMessage && (
    <View style={styles.replyContainer}>
      <Text style={styles.replyPreviewText}>
        Replying to: {repliedMessage.sender}
      </Text>
      <TouchableOpacity onPress={() => setRepliedMessage(null)}>
        <MaterialIcons name="close" size={20} color="red" />
      </TouchableOpacity>
    </View>
  )}

  {/* حقل الإدخال */}
  <TextInput
    style={styles.input}
    value={message}
    onChangeText={setMessage}
    placeholder="اكتب رسالتك هنا"
    placeholderTextColor="#999999"
    textAlign="right"
    multiline={true} // لجعل الإدخال يدعم عدة أسطر
  />

  {/* زر الإرسال */}
  <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
    <MaterialIcons name="send" size={24} color="white" />
  </TouchableOpacity>

  {/* زر المغادرة */}
  <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
    <MaterialIcons name="exit-to-app" size={24} color="black" />
  </TouchableOpacity>
</View>

    </LinearGradient>
  );
  return (
    <View style={styles.container}>
      {selectedAgeGroup ? (
        renderChatScreen()
      ) : (
        <ScrollView style={styles.ageGroupContainer}>
          {ageGroups.map((ageGroup, index) => (
            <View key={index} style={styles.groupCard}>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() =>
                  joinedGroups[ageGroup]
                    ? handleOpenChat(ageGroup)
                    : handleJoinGroup(ageGroup)
                }
              >
                <MaterialIcons
                  name={joinedGroups[ageGroup] ? "chat" : "group-add"}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.joinButtonText}>
                  {joinedGroups[ageGroup] ? "فتح المحادثة" : "انضمام"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.ageGroupText}>{ageGroup}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  ageGroupContainer: { padding: 10,     backgroundColor: '#e6f0ff',
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
   
  },
  ageGroupText: { fontSize: 16, color: "#333", marginLeft: 10 ,fontWeight: "bold"},
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7494ec",
    padding: 10,
    borderRadius: 5,
  },
  joinButtonText: { marginLeft: 5, color: "#fff", fontSize: 16 },
  chatContainer: { flex: 1, backgroundColor: "#a59ead", padding: 10 },
  chatTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  messagesContainer: { flex: 1 },
  noMessages: { fontSize: 16, color: "#888", textAlign: "center", marginTop: 20 },
  message: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "80%",
  },
  myMessage: { backgroundColor: "#7494ec", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "white", alignSelf: "flex-start" },
  sender: { fontWeight: "bold", fontSize: 14,color: "#888" },
  timestamp: { fontSize: 12, color: "#888", textAlign: "right" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  
  input: {
    flex: 1, // لتوسيع الإدخال وفقًا لمساحة الشاشة
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
    minHeight: 40, // الحد الأدنى للارتفاع
    maxHeight: 100, // الحد الأقصى للارتفاع لتجنب تجاوز الشاشة
  },
  
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    padding: 5,
    backgroundColor: "#f7f7f7",
    borderLeftWidth: 4,
    borderLeftColor: "#7494ec",
    borderRadius: 5,
    flex: 1,
  },
  
  replyPreviewText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 5,
  },
  
  sendButton: {
    backgroundColor: "#7494ec",
    padding: 7,
    borderRadius: 5,
  },
  sendButtonText: { color: "#fff", fontSize: 16 },
  leaveButton: {
    marginLeft: 10,
    padding: 7,
    backgroundColor: "white",
    borderRadius: 5,
  },
  messageText: {
    color: "black", // لون النص الافتراضي
    fontSize: 16,
  },
  myMessageText: {
    color: "white", // لون النص الخاص بالمرسل
  },
  backToGroupsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 6,
    borderRadius: 5,
    marginRight: 3,
    
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  replyText: {
    color: "#7494ec",
    fontSize: 14,
    marginLeft: 5,
  },
  replyBox: {
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 4,
    borderLeftColor: "#7494ec",
    padding: 5,
    marginBottom: 5,
    borderRadius: 5,
  },
  replyLabel: {
    fontSize: 12,
    color: "#888",
  },
  replyMessage: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
  repliedMessageBox: {
    backgroundColor: "#f7f7f7",
    padding: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#7494ec",
    marginBottom: 5,
    borderRadius: 5,
    borderRadius:8,
  },
  replyToSender: {
    fontWeight: "bold",
    color: "#555",
  },
  replyToMessage: {
    color: "#555",
    fontStyle: "italic",
  },
  
  
});

export default ChatApp;
