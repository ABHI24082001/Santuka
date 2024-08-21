import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const HeaderMenu = () => {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/logout.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10, // Adjust the margin as needed
  },
  logo: {
    width: 40, // Set the width and height of the logo
    height: 40,
  },
});

export default HeaderMenu;
