import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {encode as base64Encode} from 'base-64';
import {useNavigation, useRoute} from '@react-navigation/native';
import {response} from 'express';

const Reconciliation = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [loading, setLoading] = useState(false);
  const [scannedLR, setScannedLR] = useState('');
  const [tpData, setTpData] = useState('');
  const [truckNo, setTruckNo] = useState('');
  const [grossWT, setGrossWT] = useState('');
  const [tareWT, setTareWT] = useState('');
  const [netWT, setNetWT] = useState('');
  const [permitNo, setPermitNo] = useState('');
  const [cash, setCash] = useState('');
  const [bankAmt, setBankAmt] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [hsdAmt, setHsdAmt] = useState('');
  const [pumpName, setPumpName] = useState('');
  const [slipNo, setSlipNo] = useState('');
  const [apiError, setApiError] = useState(null);
  const [isReconciled, setIsReconciled] = useState(false);
  const [utrno, setUtrno] = useState('');
  const [hasError, setHasError] = useState(false);
  const [username, setUsername] = useState(route.params?.username || '');
  const [password, setPassword] = useState(route.params?.password || '');
  // Assume you have a function to handle scanned LR, for example, when a barcode is scanned
  const handleScannedLR = scannedLR => {
    // Call the function to check and fetch LR details
    checkLRAndUpdateData(scannedLR);
  };

  const clearError = () => {
    setHasError(false);
  };
  console.log('username recon', username);
  console.log('password re', password);

  // Function to check LR and fetch details
  const checkLRAndUpdateData = async lrNo => {
    try {
      setLoading(true);

      const base64Credentials = base64Encode(`${username}:${password}`);
      const config = {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
      };

      const url = `http://mis.santukatransport.in/API/Test/GetLRDetails?LrNo=${lrNo}`;
      console.log('Request URL:', url);
      const response = await axios.get(url, config);

      if (response.status === 200) {
        const responseData = response.data.data;

        setTpData(responseData.Tp || '');
        setTruckNo(responseData.TruckNo || '');
        setGrossWT(
          responseData.GrossWT ? responseData.GrossWT.toFixed(3) : '0.000',
        );
        setTareWT(
          responseData.TareWT ? responseData.TareWT.toFixed(3) : '0.000',
        );
        setNetWT(responseData.NetWT ? responseData.NetWT.toFixed(3) : '0.000');
        setPermitNo(responseData.PermitNo || '');
        setUpiId(responseData.UpiId || '');
        setCash(responseData.Cash ? responseData.Cash.toFixed(2) : '0.00');
        setBankAmt(
          responseData.BankAmt ? responseData.BankAmt.toFixed(2) : '0.00',
        );
        setUtrno(responseData.UTRNO || '');
        setHsdAmt(responseData.Hsd ? responseData.Hsd.toFixed(2) : '0.00');

        const isReconciledValue = responseData.IsReconcile;
        setIsReconciled(isReconciledValue);

        if (isReconciledValue) {
          console.log('Alert: This LR is already reconciled.');
          Alert.alert('Alert', 'This LR is already reconciled.');
          clearAllFields();
        } else {
          setPumpName('');
          setSlipNo('');
          setApiError(null);
        }
      } else {
        console.error('API request failed with status code', response.status);
        setApiError('Error: ' + response.status);
        clearAllFields();
      }
    } catch (error) {
      console.error('API request error:', error);
      setApiError('Error: ' + error.message);
      clearAllFields();
    } finally {
      setLoading(false);
    }
  };

  //After scanning the LR NO it will automatically hit the get details api
  useEffect(() => {
    if (route.params?.scannedLR) {
      const scannedLRNo = route.params.scannedLR;
      setScannedLR(scannedLRNo);

      // Check if the LR is reconciled and fetch details if not
      checkLRAndUpdateData(scannedLRNo);
    }
  }, [route.params]);

  const clearAllFields = () => {
    setScannedLR('');
    setTpData('');
    setTruckNo('');
    setGrossWT('');
    setTareWT('');
    setNetWT('');
    setPermitNo('');
    setCash('');
    setBankAmt('');
    setUpiAmount('');
    setUpiId('');
    setHsdAmt('');
    setPumpName('');
    setSlipNo('');
    setUtrno('');
  };
  const handleScanButtonPress = () => {
    clearError();
    navigation.navigate('ScannerLR');
  };

  // FOR POST THE DATA (UPDATE)
  const postDataToApi = async () => {
    if (isReconciled) {
      Alert.alert('Alert', 'This LR is already reconciled.');
      return;
    }

    // Check if at least one input field is filled
    if (!cash && !bankAmt && !hsdAmt && !pumpName && !slipNo) {
      Alert.alert('Error', 'Please fill input fields before submitting.');
      return;
    }

    try {
      const base64Credentials = base64Encode(`${username}:${password}`);
      const config = {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
      };

      // Fetch the LR ID dynamically based on the scanned LR number
      const lrNo = scannedLR;
      const lrDetailsUrl = `http://mis.santukatransport.in/API/Test/GetLRDetails?LrNo=${lrNo}`;
      const lrDetailsResponse = await axios.get(lrDetailsUrl, config);

      if (lrDetailsResponse.status === 200) {
        const lrId = lrDetailsResponse.data.data.Id;

        // Construct the data object to update
        const updatedData = {
          Id: lrId,
          Cash: cash ? parseFloat(cash) : 0,
          BankAmt: bankAmt ? parseFloat(bankAmt) : 0,
          upiAmount: upiAmount ? parseFloat(upiAmount) : 0,
          Hsd: hsdAmt ? parseFloat(hsdAmt) : 0,
          PumpName: pumpName || '',
          SlipNo: slipNo || '',
          IsReconcile: true,
          UpiId: upiId, // Set IsReconcile to true after reconciliation
        };

        // Construct the API endpoint URL for updating data
        const updateUrl = `http://mis.santukatransport.in/API/Test/GetLRDetails`; // Change to the correct API endpoint for updating
        console.log('Request URL:', updateUrl); // Log the URL

        const response = await axios.post(updateUrl, updatedData, config);

        if (response.status === 200) {
          Alert.alert('Success', 'Data updated successfully.');
          setIsReconciled(true); // Set IsReconcile to true after reconciliation
          // Clear the form after successfully updating data
          clearAllFields();
        } else {
          console.error('API request failed with status code', response.status);
          Alert.alert('Error', 'Failed to update data.');
        }
      } else {
        console.error(
          'API request failed with status code',
          lrDetailsResponse.status,
        );
        Alert.alert('Error', 'Failed to fetch LR details.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error Response:', error.response.status);
        Alert.alert('Error', `Error Status: ${error.response.status}`);
      } else {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'An error occurred while sending the data to the API.',
        );
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TextInput
            placeholder="LR No"
            placeholderTextColor="#666666"
            style={styles.textInput}
            autoCapitalize="none"
            value={scannedLR}
            editable={false}
            onChangeText={text => setScannedLR(text)}
            color="black"
          />

          <TouchableOpacity
            style={styles.Scan}
            onPress={() => {
              clearError();
              handleScanButtonPress();
            }}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[styles.buttonText, styles.buttonTextBottom]}>
                Scan
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {apiError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#666666"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={tpData} // Display TP Data
            editable={false}
            color="black"
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              TP Data
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#666666"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={truckNo.toString()} // Convert to string
            editable={false}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              TruckNo.
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#666666"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={grossWT.toString()} // Convert to string
            editable={false}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              GrossWT
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#666666"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={tareWT.toString()} // Convert to string
            editable={false}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              TareWT
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=" "
            placeholderTextColor="#666666"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={netWT.toString()} // Convert to string
            editable={false}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              NetWT
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#666666"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={permitNo ? permitNo.toString() : ''}
            editable={false}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              PermitNo.
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#0000"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={upiId}
            color="black"
            editable={false}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              Upi Id
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#0000"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={bankAmt}
            color="black"
            editable={false}
            onChangeText={text => setBankAmt(text)}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              UPI(Amt)
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#0000"
            style={styles.textInputLock}
            autoCapitalize="none"
            value={utrno}
            color="black"
            editable={false}
            onChangeText={text => setUtrno(text)}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              UTR No
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#0000"
            style={styles.textInput}
            autoCapitalize="none"
            value={cash}
            color="black"
            editable={true}
            onChangeText={text => setCash(text)}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>Cash</Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#0000"
            style={styles.textInput}
            autoCapitalize="none"
            value={hsdAmt}
            color="black"
            onChangeText={text => setHsdAmt(text)}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              HSD(Amt)
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#0000"
            style={styles.textInput}
            autoCapitalize="none"
            value={pumpName}
            color="black"
            onChangeText={text => setPumpName(text)}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              PumpName
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder=""
            placeholderTextColor="#000"
            style={{...styles.textInput, color: 'black'}}
            autoCapitalize="none"
            value={slipNo}
            onChangeText={text => setSlipNo(text)}
          />

          <View style={styles.Name}>
            <Text style={[styles.NameText, styles.buttonTextBottom]}>
              SlipNo.
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.Clear} onPress={clearAllFields}>
            <Text style={[styles.buttonText, styles.buttonTextBottom]}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.Submit} onPress={postDataToApi}>
            <Text style={[styles.buttonText, styles.buttonTextBottom]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 70,
  },
  row: {
    flexDirection: 'row',
    marginBottom: -10,
    marginTop: 10,
  },
  textInput: {
    width: '60%',
    height: 40,
    fontSize: 15,
    top: 10,
    borderWidth: 1.5,
    borderColor: '#66666666',
    padding: 10,
  },
  textInputLock: {
    width: '60%',
    height: 40,
    fontSize: 15,
    top: 10,
    borderWidth: 1.5,
    borderColor: '#66666666',
    padding: 10,
    backgroundColor: '#DCDCDC',
    color: '#000',
  },
  Scan: {
    bottom: 0,
    width: '30%',
    height: 40,
    backgroundColor: '#2E5090',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Name: {
    width: '30%',
    height: 30,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  NameText: {
    color: 'black',
    fontSize: 15,
    justifyContent: 'flex-start',
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
    marginTop: 20,
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
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextBottom: {
    position: 'absolute',
    justifyContent: 'center',
  },
  errorContainer: {
    margin: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  displayDataContainer: {
    backgroundColor: '#2E5090',
    padding: 10,
    borderRadius: 5,
  },
  scannedDataText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Reconciliation;
