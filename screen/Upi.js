import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
import RNUpiPayment from 'react-native-upi-payment';
import { useRoute } from '@react-navigation/native';

const Upi = () => {
  const route = useRoute();
  const { paValue } = route.params;
  const [upiAmount, setUpiAmount] = useState('');
  const [paymentResponse, setPaymentResponse] = useState('');

  const paymentGateway = async () => {
    if (upiAmount.trim() !== '') {
      RNUpiPayment.initializePayment(
        {
          vpa: paValue,
          payeeName: paValue,
          amount: upiAmount,
          transactionRef: '123-asf-45',
          
        },
        successCallback,
        failureCallback
      );
    } else {
      setPaymentResponse('Please enter the UPI amount.');
    }
  };

  function successCallback(data) {
    const transactionId = data.transactionId;
    if (transactionId) {
      console.log(`Transaction ID: ${transactionId}`);
      setPaymentResponse(`Payment successful. Transaction ID: ${transactionId}`);
    } else {
      handleTransactionIdNotAvailable();
    }
  }
  
  function handleTransactionIdNotAvailable() {
    setPaymentResponse('Payment successful but transaction ID not available.');
  }

  function failureCallback(data) {
    console.log(data);
    setPaymentResponse('Payment failed.');
  }

  return (
    <View style={styles.container}>
      <Text style={{marginBottom:'10px',padding:15}}>{paValue}</Text>
      <TextInput
        placeholder="Amount"
        placeholderTextColor="#666666"
        style={styles.textInput}
        autoCapitalize="none"
        value={upiAmount}
        editable={true}
        onChangeText={(text) => setUpiAmount(text)}
      />
      <Button title="Pay Now" onPress={paymentGateway} style={styles.button} />
      <Text>{paymentResponse}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  textInput: {
    width: '50%',
    height: 40,
    fontSize: 15,
    color: 'black',
    borderWidth: 1.5,
    borderColor: '#66666666',
    paddingLeft: 20,
    backgroundColor: '#DCDCDC',
    bottom: 10,
  },
  button: {
    width: '50%',
  },
});

export default Upi;
