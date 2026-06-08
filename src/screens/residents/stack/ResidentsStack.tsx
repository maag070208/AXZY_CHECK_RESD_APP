import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ResidentListScreen } from '../screens/ResidentListScreen';
import { ResidentDetailScreen } from '../screens/ResidentDetailScreen';
import { ResidentFormScreen } from '../screens/ResidentFormScreen';
import { HeaderBack } from '../../../navigation/header/HeaderBack';

const Stack = createNativeStackNavigator();

export const ResidentsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RESIDENTS_LIST"
        component={ResidentListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Gestión de Residentes"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="RESIDENT_DETAIL"
        component={ResidentDetailScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Detalle del Residente"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="RESIDENT_FORM"
        component={ResidentFormScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
