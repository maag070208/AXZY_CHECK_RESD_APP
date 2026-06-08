import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { ResidencialesScreen } from '../screens/ResidencialesScreen';
import { CreateResidencialScreen } from '../screens/CreateResidencialScreen';

const Stack = createNativeStackNavigator();

export const ResidencialesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CLIENTS_MAIN"
        component={ResidencialesScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Clientes"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="CREATE_CLIENT"
        component={CreateResidencialScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Nuevo Cliente"
              back={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
