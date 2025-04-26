import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'; // استيراد الأيقونات
import { LinearGradient } from 'expo-linear-gradient'; // استيراد LinearGradient
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';

const ChatApp = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    setMessages([...messages, { text: input, sender: 'user' }]);

    const response = await fetch(`${ipAdd}:8888/APIS/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: input }),
    });

    const data = await response.json();

    setMessages([
      ...messages,
      { text: input, sender: 'user' },
      { text: data.text, sender: 'bot' },
    ]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>للردود التلقائية الفورية</Text>

        <ScrollView contentContainerStyle={styles.chatWindow}>
          <LinearGradient
            colors={["#e2e2e2", "#c9d6ff"]} // تطبيق التدرج اللوني
            style={styles.gradientBackground}
          >
            {messages.length ? (
              messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.message,
                    {
                      backgroundColor: msg.sender === 'user' ? '#7494ec' : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : '#7494ec',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    },
                  ]}
                >
                  <Text style={{ color: msg.sender === 'user' ? '#ffffff' : '#7494ec' }}>
                    {msg.text}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.placeholder}>ابدأ المحادثة الآن!</Text>
            )}
          </LinearGradient>
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            placeholder="أرسل سؤالاً..."
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialCommunityIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0ff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between', // توزيع المحتوى بشكل جيد بين الشات ومربع الإدخال
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color:"#4e54c8"
  },
  chatWindow: {
    flexGrow: 1, // يسمح للـ ScrollView بالنمو لأخذ المساحة المتبقية
    marginBottom: 20,
    padding: 0,
  },
  gradientBackground: {
    flex: 1, // يضمن أن LinearGradient يملأ المساحة بالكامل داخل الـ ScrollView
    borderRadius: 10,
    padding: 10,
  },
  message: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor:"white"

  },
  sendButton: {
    padding: 10,
    backgroundColor: '#7494ec',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatApp;
