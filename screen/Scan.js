import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { encode as base64Encode } from 'base-64';

const Reconciliation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [scannedLR, setScannedLR] = useState(route.params?.scannedLR || '');
  const [loading, setLoading] = useState(false);
  const [tpData, setTpData] = useState('');
  const [truckNo, setTruckNo] = useState('');
  const [grossWT, setGrossWT] = useState('');
  const [tareWT, setTareWT] = useState('');
  const [netWT, setNetWT] = useState('');
  const [permitNo, setPermitNo] = useState('');
  const [cash, setCash] = useState('');
  const [bankAmt, setBankAmt] = useState('');
  const [hsdAmt, setHsdAmt] = useState('');
  
  const checkLRAndUpdateData = async () => {
    try {
      setLoading(true); // Start loading indicator
  
      // Encode 'admin:admin' in Base64 format
      const base64Credentials = base64Encode('admin:admin');
  
      // Create an Axios config object with the Authorization header
      const config = {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
        params: {
          lrNo: scannedLR,
        },
      };
  
      const response = await axios.get(
        'http://mis.santukatransport.in/API/Test/GetLRDetails',
        config
      );
  
      if (response.status === 200) {
        const responseData = response.data.data;
        setTpData(responseData.Tp);
        setTruckNo(responseData.TruckNo);
        setGrossWT(responseData.GrossWT);
        setTareWT(responseData.TareWT);
        setNetWT(responseData.NetWT);
        setPermitNo(responseData.PermitNo);
        setCash(responseData.Cash);
        setBankAmt(responseData.BankAmt);
        setHsdAmt(responseData.Hsd);
        // Update other state variables as needed
      } else {
        console.error('API request failed');
      }
    } catch (error) {
      console.error('API request error:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <TextInput
          placeholder="LR No."
          placeholderTextColor="#000"
          style={styles.textInputLock}
          autoCapitalize="none"
          value={scannedLR} // Display scanned LR data
          editable={false}
        />

        <TouchableOpacity
          style={styles.Scan}
          onPress={async () => {
            // Trigger the API request when the "Scan" button is pressed
            checkLRAndUpdateData();

            // Navigate to 'ScannerLR'
            navigation.navigate('ScannerLR');
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[styles.buttonText, styles.buttonTextBottom]}>Scan</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Display TP Data in a disabled TextInput */}
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          value={tpData} // Display TP Data
          editable={false}
        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>TP Data</Text>
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
          <Text style={[styles.NameText, styles.buttonTextBottom]}>TruckNo.</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          value={grossWT.toString()} // Display TP Data

          editable={false}
        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>GrossWT</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          editable={false}
          value={tareWT.toString()} // Display TP Data

        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>TareWT</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          editable={false}
          value={netWT.toString()} // Display TP Data

        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>NetWT</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#666666"
          style={styles.textInputLock}
          autoCapitalize="none"
          editable={false}
          value={permitNo.toString()} // Display TP Data

        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>PermitNo.</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#0000"
          style={styles.textInput}
          autoCapitalize="none"
          value={cash.toString()} // Display TP Data

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
          value={bankAmt.toString()} // Display TP Data

        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>Bank(Amt)</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#0000"
          style={styles.textInput}
          autoCapitalize="none"
          value={hsdAmt.toString()} // Display TP Data

        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>HSD(Amt)</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#0000"
          style={styles.textInput}
          autoCapitalize="none"
        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>PumpName</Text>
        </View>

      </View>
      <View style={styles.row}>
        <TextInput
          placeholder=""
          placeholderTextColor="#0000"
          style={styles.textInput}
          autoCapitalize="none"
        />

        <View style={styles.Name}>
          <Text style={[styles.NameText, styles.buttonTextBottom]}>SlipNo.</Text>
        </View>

      </View>







      <View style={styles.row}>
        <TouchableOpacity style={styles.Clear}>
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>Clear</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.Submit}>
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>Submit</Text>
        </TouchableOpacity>

      </View>
      
    </ScrollView >
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
    width: '60%',
    height: 40,
    fontSize: 15,
    top: 10,
    color: '#000',
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
    color:'#000',
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
    bottom:0,
    width: '30%',
    height: 40,
    backgroundColor: '#2E5090',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',      // Center horizontally
    justifyContent: 'center',
  },  // Center vertically
  Name: {


    width: '30%',
    height: 30,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',      // Center horizontally
    justifyContent: 'center',
  },
  NameText: {
    color: 'black',
    fontSize: 15,
    justifyContent: 'flex-start'

  },
  LR: {

    width: 100,
    height: 100,
    backgroundColor: '#ffff',
    padding: 0,
    margin: 10,
    borderRadius: 5,
  },  // Center vertically
  LRphoto: {

    width: 90,
    height: 90,
    backgroundColor: '#ffff',
    paddingTop: 15,
    margin: 5,

    borderRadius: 5,
  },  // Center vertically
  Submit: {

    width: '45%',
    height: 40,
    backgroundColor: '#2E5090',
    padding: 20,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',      // Center horizontally
    justifyContent: 'center',
  },  // Center vertically
  Clear: {

    width: '45%',
    height: 40,
    backgroundColor: 'red',
    padding: 20,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',      // Center horizontally
    justifyContent: 'center',
  },  // Center vertically
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextBottom: {
    position: 'absolute',
    justifyContent:'center',
  },
  buttonImage: {
    width: 30, // Set the width and height as needed
    height: 30,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 40, // Adjust spacing between image and text
    top: 15,
  },
  buttonImage2: {
    width: 30, // Set the width and height as needed
    height: 30,
    marginBottom: 20,
    marginLeft: -40,
    marginRight: 10, // Adjust spacing between image and text
    top: 15,
  },

});

export default Reconciliation;