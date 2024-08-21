import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image,Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

class UpiScanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scannedLR: '',
      torchOn: false,
    };
  }

  toggleTorch = () => {
    this.setState((prevState) => ({
      torchOn: !prevState.torchOn,
    }));
  };

  onSuccess = (e) => {
    const scannedData = e.data;
    const regex = /pa=([^&]+)/;
    const match = regex.exec(scannedData);
  
    if (match) {
      const paValue = decodeURIComponent(match[1]);
      console.log('Extracted "pa" parameter value:', paValue);
      this.props.navigation.navigate('Data', { paValue });
    } else {
      Alert.alert('Error', 'Invalid Qrcode');
    }
  };
  
  
  
   

  render() {
    const { torchOn } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 2 }}>
          <QRCodeScanner
            onRead={this.onSuccess}
            reactivate={true}
            reactivateTimeout={2000}
            showMarker={true}
            flashMode={torchOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
          />
        </View>

        <View style={{ flex: 0.3, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        <TouchableOpacity
  style={[styles.buttonTouchable, styles.centeredFlashImage]}
  onPress={this.toggleTorch}
>
  {/* Use conditional rendering based on torchOn state */}
  <View style={styles.flashImageContainer}>
    {torchOn ? (
      <Image source={require('./assets/flash-off.png')} style={styles.flashImage} />
    ) : (
      <Image source={require('./assets/flash.png')} style={styles.flashImage} />
    )}
  </View>
</TouchableOpacity>



          <View style={styles.displayDataContainer}>
            <Text style={styles.scannedDataText}>
              {this.state.scannedLR}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonTouchable: {
    padding: 16,
    
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  displayDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedDataText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  flashImage: {
    width: 32,
    height: 32,
    marginLeft:'55%',
  },
  centeredFlashImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});

export default UpiScanner;
