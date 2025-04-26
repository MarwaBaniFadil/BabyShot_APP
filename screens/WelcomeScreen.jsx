import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    // Navigate to the next screen (e.g., Login or Registration)
    navigation.navigate('Login'); // Change 'Login' to your desired screen
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('C:/Users/ELIFE STORE/children_vaccination_clinic/images/baby.gif')} // Replace with your image path
        style={styles.image}
      />
      <Text style={styles.title}>
        <Text style={styles.welcomeText}>أهلاً بكم في  </Text>
        <Text style={styles.babyShotText}>Baby Shot</Text>
      </Text>
      <Text style={styles.description}>
      تطبيقك الأمثل لمتابعة تطعيمات وفحوصات صحة أطفالك بكل سهولة.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>ابدأ الآن</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Set background to white
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    flexDirection: 'row', // Ensure text appears inline
  },
  welcomeText: {
    color: '#000', // Color for "Welcome to"
  },
  babyShotText: {
    color: '#7494ec', // Color for "Baby Shot"
  },
  description: {
    fontSize: 16,
    color: '#000', // Purple color for the description
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7494ec', // Purple background for the button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff', // White text for the button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
