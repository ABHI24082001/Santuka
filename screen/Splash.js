import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

const App = ({ navigation }) => {
  useEffect(() => {
    SplashScreen.hide(); // Hide the splash screen when your app is ready

    // Redirect to Login.js after 3 seconds
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }, 3000); // 3000 milliseconds (3 seconds)
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('./assets/santuka.png')} style={styles.image} />
      <Text style={styles.text}>Santuka</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  image: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 10, // Adjust the margin to your preference
    fontSize: 25, // Adjust the font size to your preference
    color: 'black',
    fontWeight: 'bold',
  },
});

export default App;
