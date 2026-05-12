import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { LocationsScreen } from '../screens/LocationsScreen';
import { BulkPrintScreen } from '../screens/BulkPrintScreen';

const Stack = createNativeStackNavigator();

export const LocationsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LOCATIONS_MAIN"
        component={LocationsScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Ubicaciones"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="LOCATIONS_BULK_PRINT"
        component={BulkPrintScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Impresión Masiva"
              back={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
