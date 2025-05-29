import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import GoogleSignInScreen from './screens/GoogleSignInScreen';
import ListDevices from './screens/ListDevices';
import BorrowedEquipmentUser from './screens/BorrowedEquipmentUser';
import BorrowerListManagement from './screens/Moderator/BorrowerListManagement';

enableScreens();

const Stack = createStackNavigator();

const toastConfig = {
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#FE6301',
        height: 80,
        width: '90%',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
      }}
      text2Style={{
        fontSize: 16,
        color: '#333',
        lineHeight: 20,
      }}
      text2NumberOfLines={3}
    />
  ),
};

export default function App() {
  return (
    <>
      <NavigationContainer theme={DefaultTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
          initialRouteName={'GoogleSignInScreen'}
        >
          <Stack.Screen name="GoogleSignInScreen" component={GoogleSignInScreen} />
          <Stack.Screen name="ListDevices" component={ListDevices} />
          <Stack.Screen name="BorrowedEquipmentUser" component={BorrowedEquipmentUser} />
          <Stack.Screen name="BorrowerListManagement" component={BorrowerListManagement} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}