import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { FeeFormScreen } from '../screens/FeeFormScreen';
import { FeesListScreen } from '../screens/FeesListScreen';

const Stack = createNativeStackNavigator();

export const FeesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FEES_LIST"
        component={FeesListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Cuotas y Planes" back={true} />
          ),
        })}
      />
      <Stack.Screen
        name="FEE_FORM"
        component={FeeFormScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Cuota" back={true} />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
