import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { AccessesListScreen } from '../screens/AccessesListScreen';
import { AccessQrScreen } from '../screens/AccessQrScreen';

const Stack = createNativeStackNavigator();

export const AccessesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AccessesList"
        component={AccessesListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Control de Accesos"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AccessQrScan"
        component={AccessQrScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
