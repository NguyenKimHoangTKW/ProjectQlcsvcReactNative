import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import GoogleSignInScreen from './screens/GoogleSignInScreen';
import ListDevices from './screens/ListDevices';
import BorrowedEquipmentUser from './screens/BorrowedEquipmentUser';
import BorrowerListManagement from './screens/Moderator/BorrowerListManagement';

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  return (
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
  );
}