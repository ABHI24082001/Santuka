import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';

const LrPhoto = ({ navigation }) => {
  const cameraRef = useRef(null);

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: false };
      const data = await cameraRef.current.takePictureAsync(options);
      navigation.navigate('Data', { capturedPhoto: data });
      console.log('fetching',data);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
      />
      <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
        <Text style={styles.captureButtonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  captureButton: {
    backgroundColor: '#2E5090',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default LrPhoto;
