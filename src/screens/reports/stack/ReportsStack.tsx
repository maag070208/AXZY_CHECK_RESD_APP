import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { ReportsListScreen } from '../screens/ReportsListScreen';

const Stack = createNativeStackNavigator();

export const ReportsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ReportsList"
        component={ReportsListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Reportes"
              back={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
