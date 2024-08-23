import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {encode as base64encode} from 'base-64';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Data = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [upiAmount, setUpiAmount] = useState('');
  const [scannedTP, setScannedTP] = useState('');
  const [scannedChallan, setScannedChallan] = useState('');
  const [tpDetails, setTpDetails] = useState(null);
  const [challanDetails, setChallanDetails] = useState(null);
  const [truckNo, setTruckNo] = useState('');
  const [cash, setCash] = useState('');
  const [bankAmt, setBankAmt] = useState('');
  const [hsdAmt, setHsdAmt] = useState('');
  const [pumpName, setPumpName] = useState('');
  const [slipNo, setSlipNo] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [username, setUsername] = useState(route.params?.username || '');
  const [password, setPassword] = useState(route.params?.password || '');
  const [deviceId, setDeviceId] = useState(route.params?.deviceId || '');
  const [isLoading, setIsLoading] = useState(false);
  const {paValue} = route.params;
  // Initialize upiId with paValue
  const [upiId, setUpiId] = useState(paValue);
  // testing.....
  console.log('Extracted "pa" parameter value:', paValue);
  console.log('paValue:', paValue);
  console.log('upiId:', upiId);
  console.log('DeviceId Data page', deviceId);
  console.log('username data', username);
  console.log('password data', password);

  useEffect(() => {
    if (paValue) {
      setUpiId(paValue);
    }
  }, [paValue]);

  console.log('upiId in useEffect:', upiId);

  useEffect(() => {
    if (route.params?.capturedPhoto) {
      setCapturedPhoto(route.params.capturedPhoto);
    }
  }, [route.params]);
  const base64Credentials = base64encode(`${username}:${password}`);

  const storeDataOffline = async data => {
    try {
      const storedData = await AsyncStorage.getItem('offlineData');
      let dataArray = [];

      if (storedData !== null) {
        dataArray = JSON.parse(storedData);

        // Check if data with the same Challan (LRNo) already exists
        const existingData = dataArray.find(
          entry => entry.Challan === data.Challan,
        );

        if (existingData) {
          Alert.alert(
            'Error',
            'Data with the same Challan number already exists in offline storage.',
          );
          return;
        }
      }

      dataArray.push(data);

      await AsyncStorage.setItem('offlineData', JSON.stringify(dataArray));
      console.log('Data stored offline:', data);
      Alert.alert('Success', 'Data stored offline successfully');

      // Clear input fields after successful storage
      setUpiAmount('');
      setScannedTP('');
      setScannedChallan('');
      setTruckNo('');
      setCash('');
      setBankAmt('');
      setHsdAmt('');
      setPumpName('');
      setSlipNo('');
      setCapturedPhoto('');
      setUpiId('');
    } catch (error) {
      console.error('Error storing data offline:', error);
      Alert.alert('Error', 'An error occurred while storing data offline.');
    }
  };

  useEffect(() => {
    const retrieveData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('offlineData');

        if (storedData !== null) {
          console.log('Retrieved data from AsyncStorage:', storedData);
        } else {
          console.log('No data found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error retrieving data from AsyncStorage:', error);
        Alert.alert(
          'Error',
          'An error occurred while retrieving data from AsyncStorage.',
        );
      }
    };

    retrieveData();
  }, []);

  const checkAndSendData = async () => {
    try {
      const isConnected = await NetInfo.fetch().then(
        state => state.isConnected,
      );

      if (isConnected) {
        const storedData = await AsyncStorage.getItem('offlineData');

        if (storedData !== null) {
          const dataArray = JSON.parse(storedData);

          for (const dataObject of dataArray) {
            try {
              const response = await axios.post(
                'https://mis.santukatransport.in/API/Test/AddEntry',
                dataObject,
                {
                  headers: {
                    Authorization: 'Basic ' + base64Credentials,
                  },
                },
              );

              if (response.status === 200) {
                console.log('API Response:', response.data);
              } else {
                Alert.alert('Error', 'Failed to insert data into the API.');
              }
            } catch (error) {
              console.error('API Request Error:', error);
            }
          }

          await AsyncStorage.removeItem('offlineData');

          navigation.navigate('OfflineReport', {offlineData: dataArray});
        }
      }
    } catch (error) {
      console.error('Error checking and sending data:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkAndSendData, 5000); // 5 seconds (in milliseconds)

    return () => clearInterval(interval);
  }, []);

  const postDataToApi = async () => {
    if (!scannedTP || !scannedChallan) {
      Alert.alert('Error', 'TP and Challan are mandatory fields.');
      return;
    }

    // Check if "Santuka" is present in scannedTP
    if (!scannedTP.includes('SANTUKA TRANSPORT')) {
      Alert.alert(
        'Error',
        'This TP is not belongs to SANTUKA TRANSPORT. Pls Verify',
      );
      return;
    }

    // Validate UPI amount
    const numericBankAmt = parseFloat(bankAmt);

    if (bankAmt && (isNaN(numericBankAmt) || numericBankAmt > 10000)) {
      Alert.alert('Error', 'UPI amount should not be more than 10000.');
      return;
    }

    if (
      (upiId && !bankAmt) ||
      (!upiId && bankAmt) ||
      (upiId && numericBankAmt === 0)
    ) {
      Alert.alert(
        'Error',
        'Both UPI ID and UPI amount are required if one is provided, and UPI amount should not be zero.',
      );
      return;
    }

    setIsLoading(true);
    try {
      const challanExists = await checkChallanExistenceWithApi(scannedChallan);

      if (challanExists) {
        Alert.alert(
          'Error',
          'Challan number already exists in the database. Data not submitted.',
        );
        setIsLoading(false);
        return;
      }

      const dataToInsert = {
        Tp: scannedTP,
        Challan: scannedChallan,
        Cash: parseFloat(cash),
        Hsd: parseFloat(hsdAmt),
        UpiId: upiId,
        TruckNo: truckNo,
        BankAmt: numericBankAmt,
        SlipNo: null,
        CreatedBy: username,
        TPNo: null,
        capturedPhoto: capturedPhoto,
        UserDeviceid: deviceId,
      };

      console.log('CreatedBy:', dataToInsert.CreatedBy);
      console.log('Data to Insert:', dataToInsert);

      const isConnected = await NetInfo.fetch().then(
        state => state.isConnected,
      );

      if (isConnected) {
        const response = await axios.post(
          'https://mis.santukatransport.in/API/Test/AddEntry',
          dataToInsert,
          {
            headers: {
              Authorization: 'Basic ' + base64Credentials,
            },
          },
        );

        if (response.status === 200) {
          console.log('API Response:', response.data);
          Alert.alert('Success', response.data);
          clearForm(); // Clear input fields after successful submission
        } else if (
          response.status === 400 &&
          response.data.includes("Violation of UNIQUE KEY constraint 'uk_tp'")
        ) {
          Alert.alert(
            'Error',
            'Challan number already exists in the database. Data not submitted.',
          );
        } else {
          Alert.alert('Error', 'Failed to insert data into the API.');
        }
      } else {
        storeDataOffline(dataToInsert);
      }
    } catch (error) {
      console.error('API Request Error:', error);
      Alert.alert('Error', 'An error occurred while submitting data.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const checkTpAvailabilityWithApi = async tpNo => {
    try {
      const base64Credentials = base64encode('admin:admin');

      const response = await axios.get(
        'http://mis.santukatransport.in/API/Test/GetTPDetails',
        {
          params: {
            TPNo: tpNo,
          },
          headers: {
            Authorization: 'Basic ' + base64Credentials,
          },
        },
      );

      if (response.status === 200 && response.data) {
        Alert.alert('TP Data Available', 'The TP data is available.');
        setTpDetails(response.data.data);
      } else {
        Alert.alert('Error', 'TP data is not available.');
      }
    } catch (error) {
      console.error('Error checking TP availability with API:', error);
      Alert.alert(
        'Error',
        'An error occurred while checking TP availability with API.',
      );
    }
  };

  const checkChallanExistenceWithApi = async challanNo => {
    try {
      const base64Credentials = base64encode(`${username}:${password}`);

      const apiUrl = `http://mis.santukatransport.in/API/Test/GetLRDetails?LRNo=${challanNo}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: 'Basic ' + base64Credentials,
        },
      });

      if (response.status === 200) {
        return true;
      } else if (response.status === 404) {
        return false;
      } else {
        console.error('API Request Error:', response.data);
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const clearForm = () => {
    setUpiId('');
    setScannedTP('');
    setScannedChallan('');
    setTruckNo('');
    setCash('');
    setBankAmt('');
    setHsdAmt('');
    setPumpName('');
    setSlipNo('');
    setCapturedPhoto('');
  };

  useEffect(() => {
    if (route.params?.scannedTP) {
      setScannedTP(route.params.scannedTP);
    }
    if (route.params?.scannedChallan) {
      setScannedChallan(route.params.scannedChallan);
    }
  }, [route.params]);

  const handleScanTPPress = () => {
    navigation.navigate('ScannerTP');
  };

  const handleScanChallanPress = () => {
    navigation.navigate('ScannerChallan');
  };

  const handleScannedChallanData = scannedChallanData => {
    setScannedChallan(scannedChallanData);

    checkChallanAvailabilityWithApi(scannedChallanData);
  };

  const handleUpiPress = () => {
    navigation.navigate('Upi', {paValue: upiId});
  };
  const handleScannerPress = () => {
    navigation.navigate('UpiScanner');
  };

  const navigateToReconciliation = () => {
    navigation.navigate('Reconciliation', {tpDetails});
  };

  const handleLrPhotoPress = () => {
    navigation.navigate('LrPhoto');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <TextInput
          placeholder="TP"
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          editable={false}
          value={scannedTP}
          onChangeText={text => setScannedTP(text)}
        />
        <TouchableOpacity style={styles.Scan} onPress={handleScanTPPress}>
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>Scan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Challan"
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          editable={false}
          value={scannedChallan}
          onChangeText={text => setScannedChallan(text)}
        />
        <TouchableOpacity style={styles.Scan} onPress={handleScanChallanPress}>
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>Scan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Truck No."
          placeholderTextColor="#666666"
          style={styles.textInput}
          autoCapitalize="none"
          value={truckNo}
          editable={true}
          onChangeText={text => setTruckNo(text)}
        />
        <Image
          source={require('./assets/cargo-truck.png')}
          style={styles.buttonImage}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Cash"
          placeholderTextColor="#666666"
          style={styles.textInput}
          autoCapitalize="none"
          value={cash}
          editable={true}
          onChangeText={text => setCash(text)}
        />
        <Image
          source={require('./assets/rupee-indian.png')}
          style={styles.buttonImage}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="UPI(Amt)"
          placeholderTextColor="#666666"
          style={styles.textInput}
          autoCapitalize="none"
          keyboardType="numeric"
          maxLength={5}
          value={bankAmt}
          onChangeText={text => {
            // Remove any non-numeric characters
            const numericValue = text.replace(/[^0-9]/g, '');

            // Validate if the input is less than or equal to 10000
            if (numericValue !== '') {
              const value = parseInt(numericValue);
              if (value <= 10000) {
                setBankAmt(numericValue);
              } else {
                Alert.alert('Error', 'Amount cannot exceed 10000');
                setBankAmt(''); // Clear the input
              }
            } else {
              setBankAmt('');
            }
          }}
        />
        <Image
          source={require('./assets/bank-building.png')}
          style={styles.buttonImage}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          placeholder="Upi Id"
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          value={upiId}
          onChangeText={text => setUpiId(text)}
          editable={false}
        />
        <TouchableOpacity>
          <Image
            source={require('./assets/upi-icon.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleScannerPress}>
          <Image
            source={require('./assets/qr.png')}
            style={styles.buttonImage11}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TextInput
          placeholder="HSD(AMT)"
          placeholderTextColor="#666666"
          style={styles.textInput}
          autoCapitalize="none"
          value={hsdAmt}
          editable={true}
          onChangeText={text => setHsdAmt(text)}
        />
        <Image
          source={require('./assets/bank-building.png')}
          style={styles.buttonImage}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Pump Name"
          placeholderTextColor="#666666"
          style={styles.textInput}
          autoCapitalize="none"
          value={pumpName}
          editable={true}
          onChangeText={text => setPumpName(text)}
        />
        <Image
          source={require('./assets/gas-station.png')}
          style={styles.buttonImage}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Slip No."
          placeholderTextColor="#666666"
          style={styles.textInput}
          autoCapitalize="none"
          value={slipNo}
          editable={true}
          onChangeText={text => setSlipNo(text)}
        />
        <Image
          source={require('./assets/receipt.png')}
          style={styles.buttonImage}
        />
      </View>
      <View style={styles.row}>
        <Text style={{fontSize: 15, color: 'black'}}>LR</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.LRphoto} onPress={handleLrPhotoPress}>
          {capturedPhoto ? (
            <Image
              source={{uri: capturedPhoto.uri}}
              style={styles.buttonImage2}
            />
          ) : (
            <Image
              source={require('./assets/photo-camera.png')}
              style={styles.buttonImage}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.Clear} onPress={clearForm}>
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>
            Clear
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.Submit} onPress={postDataToApi}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[styles.buttonText, styles.buttonTextBottom]}>
              Submit
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: -10,
    marginTop: 10,
  },
  textInput: {
    width: '70%',
    height: 40,
    fontSize: 15,
    top: 10,
    color: 'black',
    borderWidth: 1.5,
    borderColor: '#66666666',
    padding: 10,
  },
  textInputLock: {
    width: '70%',
    height: 40,
    fontSize: 15,
    top: 10,
    color: 'black',
    borderWidth: 1.5,
    borderColor: '#66666666',
    padding: 10,
    backgroundColor: '#DCDCDC',
  },
  button: {
    flex: 1,
    height: 20,
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  Scan: {
    width: '20%',
    height: 30,
    backgroundColor: '#2E5090',
    padding: 20,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  LR: {
    width: 100,
    height: 100,
    backgroundColor: '#ffff',
    padding: 0,
    margin: 10,
    borderRadius: 5,
  },
  LRphoto: {
    width: 90,
    height: 90,
    backgroundColor: '#ffff',
    paddingTop: 15,
    margin: 5,
    borderRadius: 5,
  },
  Submit: {
    width: '45%',
    height: 40,
    backgroundColor: '#2E5090',
    padding: 20,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Clear: {
    width: '45%',
    height: 40,
    backgroundColor: 'red',
    padding: 20,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextBottom: {
    position: 'absolute',
    justifyContent: 'center',
  },
  buttonImage: {
    width: 30,
    height: 30,
    marginBottom: 20,
    marginLeft: 30,
    marginRight: 40,
    top: 15,
  },
  buttonImage11: {
    width: 30,
    height: 30,
    marginBottom: 20,
    marginLeft: -35,
    marginRight: 0,
    top: 15,
  },
  buttonImage2: {
    width: 80,
    height: 80,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 10,
    marginTop: -10,
  },
});

export default Data;
