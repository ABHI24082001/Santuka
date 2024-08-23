import React from 'react';
import { View, Button, Alert, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
 import AsyncStorage from '@react-native-async-storage/async-storage';
const App = () => {
  const [inputText, setInputText] = React.useState('https://mis.santukatransport.in/API/Test'); // Initial input value
  const navigation = useNavigation();

  const showAlertWithInput = () => {
    Alert.prompt(
      'Enter Text',
      'Please enter some text:',
      (text) => {
        if (text) {
          setInputText(text);
        } else {
          setInputText('');
        }
      },
      'plain-text',
      inputText
    );
  };


   const handleLogout = async () => {
     try {
       await AsyncStorage.removeItem('isLoggedIn');
       await AsyncStorage.removeItem('username');
       await AsyncStorage.removeItem('password');
       navigation.navigate('Login'); // Navigate back to the login screen
     } catch (error) {
       console.log('Error logging out:', error);
     }
   };

  // const handleLogout = () => {
  //   Alert.alert(
  //     'Confirm Logout',
  //     'Are you sure you want to log out?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Logout',
  //         onPress: () => {
  //           // Implement your logout logic here
  //           console.log('User logged out');

  //           // Navigate to the "Login" screen after logout
  //           navigation.navigate('Login');
  //         },
  //       },
  //     ]
  //   );
  // };


  // const handleLogout = async () => {
  //   try {
  //     await AsyncStorage.removeItem('isLoggedIn');
  //     navigation.navigate('Login'); // Navigate back to the login screen
  //   } catch (error) {
  //     console.log('Error logging out:', error);
  //   }
  // };
  return (
    <View style={styles.container}>
      <View style={styles.container1}>
        <TextInput
          style={styles.input}
          placeholder="Input Text"
          value={inputText}
          onChangeText={(text) => setInputText(text)}
        />
        <View style={styles.buttonContainer}>
          <View style={styles.leftButton}>
            <Button title="Logout" onPress={handleLogout} />
          </View>
          <View style={styles.rightButton}>
            <Button title="Save" onPress={showAlertWithInput} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  container1: {
    height: '20%',
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  input: {
    width: '90%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftButton: {
    width: '40%',
    marginRight: 10,
  },
  rightButton: {
    width: '40%',
    marginLeft: 10,
  },
});

export default App;
