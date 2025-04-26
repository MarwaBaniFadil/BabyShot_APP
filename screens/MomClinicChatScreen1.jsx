// ChatScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';


const ChatScreen = ({ route }) => {
  const { clinicId } = route.params; // استلام ID العيادة من الشاشة السابقة
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const flatListRef = useRef(null);

  const getTokenData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decodedToken = jwt_decode(token);
        setEmail(decodedToken.email); // استخراج البريد الإلكتروني
      }
    } catch (error) {
      console.error("Error getting token from AsyncStorage", error);
    }
  };

  useEffect(() => {
    getTokenData();
    const interval = setInterval(() => {
      if (email && clinicId) {
        axios.get(`${ipAdd}:8888/APIS/getMessages?email=${email}&clinicId=${clinicId}`)
          .then((response) => {
            const messagesArray = Object.values(response.data);
            setMessages(messagesArray || []);
          })
          .catch((error) => console.error("Error fetching messages:", error));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clinicId, email]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (!email || !message.trim()) {
      alert("اكتب رسالة.");
      return;
    }

    axios.post(`${ipAdd}:8888/APIS/sendMessageWithStatus`, {
      email,
      clinicId,
      message,
      sender: "mom",
    })
      .then(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { message, sender: "mom" }
        ]);
        setMessage("");
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        alert("Error sending message!");
      });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#e2e2e2", "#c9d6ff"]} style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ alignItems: item.sender === "mom" ? "flex-end" : "flex-start" }}>
              <Text style={{
                backgroundColor: item.sender === "mom" ? "#7494ec" : "white",
                color: item.sender === "mom" ? "white" : "#7494ec",
                padding: 12,
                borderRadius: 20,
                maxWidth: "70%",
                margin: 5,
                wordWrap: "break-word",
              }}>
                {item.message}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="اكتب رسالتك هنا"
            placeholderTextColor="#999999"
            textAlign="right"
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  chatContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: "white",
  },
  sendButton: {
    backgroundColor: "#7494ec",
    padding: 7,
    borderRadius: 5,
  },
});

export default ChatScreen;
