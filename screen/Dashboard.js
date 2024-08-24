import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import DeviceNumber from 'react-native-device-number';

const Dashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {username, password} = route.params;
  console.log('username dashboard', username);
  console.log('password dashboard', password);

  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const uniqueId = await DeviceInfo.getUniqueId();
        setDeviceId(uniqueId);
        console.log(uniqueId);
      } catch (error) {
        console.log('Error getting phone ID:', error);
        Alert.alert('Error', error.message);
      }
    };
    fetchDeviceId();
  }, []);

 
 

  const handleDataPress = () => {
    navigation.navigate('Data', {username, deviceId, password});
  };

  const handleReconciliationPress = () => {
    navigation.navigate('Reconciliation', {username, password});
  };

  const handleReportPress = () => {
    navigation.navigate('Report', {username, password});
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleOfflineReportPress = () => {
    navigation.navigate('OfflineReport');
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={handleDataPress}>
          <Image
            source={require('./assets/qr.png')}
            style={styles.buttonImage}
          />
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleReconciliationPress}>
          <Image
            source={require('./assets/pen.png')}
            style={styles.buttonImage}
          />
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>
            Reconciliation
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={handleReportPress}>
          <Image
            source={require('./assets/book.png')}
            style={styles.buttonImage}
          />
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>
            Report
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleOfflineReportPress}>
          <Image
            source={require('./assets/report.png')}
            style={styles.buttonImage}
          />
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>
            Offline Report
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.setting} onPress={handleSettingsPress}>
          <Image
            source={require('./assets/settings.png')}
            style={styles.buttonImage}
          />
          <Text style={[styles.buttonText, styles.buttonTextBottom]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: -10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 200,
    backgroundColor: 'white',
    padding: 30,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  setting: {
    flex: 1,
    height: 200,
    backgroundColor: 'white',
    padding: 30,
    margin: 10,
    marginRight: '52%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonText: {
    color: '#2E5090',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextBottom: {
    position: 'absolute',
    bottom: 25,
  },
  buttonImage: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
});

export default Dashboard;
