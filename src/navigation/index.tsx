import * as React from 'react';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRootParams } from './types';
import StartDetectScreen from '../screens/startDetect';
import DetectScreen from '../screens/detect';
import StopDetectScreen from '../screens/stopDetect';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppStack = createNativeStackNavigator<AppRootParams>();

const RootStackNavigator = () => {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="StartDetectScreen">
      <AppStack.Screen name="StartDetectScreen" component={StartDetectScreen} />
      <AppStack.Screen name="DetectScreen" component={DetectScreen} />
      <AppStack.Screen name="StopDetectScreen" component={StopDetectScreen} />
    </AppStack.Navigator>
  );
};

const NavigationRouter = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <RootStackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default NavigationRouter;
