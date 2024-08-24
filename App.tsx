import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Import screens only when they are needed
const LoginScreen = React.lazy(() => import('./screen/Login'));
const DashboardScreen = React.lazy(() => import('./screen/Dashboard'));
const DataScreen = React.lazy(() => import('./screen/Data'));
const ReportScreen = React.lazy(() => import('./screen/Report'));
const OfflineReportScreen = React.lazy(() => import('./screen/OfflineReport'));
const ReconciliationScreen = React.lazy(() => import('./screen/Reconciliation'));
const SettingsScreen = React.lazy(() => import('./screen/Settings'));
const ScannerTPScreen = React.lazy(() => import('./screen/ScannerTP'));
const ScannerChallanScreen = React.lazy(() => import('./screen/ScannerChallan'));
const ScanScreen = React.lazy(() => import('./screen/Scan'));

const UpiScannerScreen = React.lazy(() => import('./screen/UpiScanner'));
const ScannerLRScreen = React.lazy(() => import('./screen/ScannerLR'));
const LrPhotoScreen = React.lazy(() => import('./screen/LrPhoto'));
const SplashScreen = React.lazy(() => import('./screen/Splash'));

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerLeft: () => null, gestureEnabled: false }} />
        <Stack.Screen name="Data" component={DataScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ headerTitle: "Report" }} />
        <Stack.Screen name="OfflineReport" component={OfflineReportScreen} options={{ headerTitle: "OfflineReport" }} />
        <Stack.Screen name="Reconciliation" component={ReconciliationScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ScannerTP" component={ScannerTPScreen} />
        <Stack.Screen name="ScannerChallan" component={ScannerChallanScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />      
        <Stack.Screen name="UpiScanner" component={UpiScannerScreen} />
        <Stack.Screen name="ScannerLR" component={ScannerLRScreen} />
        <Stack.Screen name="LrPhoto" component={LrPhotoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
