import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { ComplaintDetailScreen } from '../screens/ComplaintDetailScreen';
import { ComplaintFormScreen } from '../screens/ComplaintFormScreen';
import { ComplaintsListScreen } from '../screens/ComplaintsListScreen';

const Stack = createNativeStackNavigator();

export const ComplaintsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="COMPLAINTS_LIST"
        component={ComplaintsListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Buzón de Quejas" back={true} />
          ),
        })}
      />
      <Stack.Screen
        name="COMPLAINT_FORM"
        component={ComplaintFormScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Nueva Queja" back={true} />
          ),
        })}
      />
      <Stack.Screen
        name="COMPLAINT_DETAIL"
        component={ComplaintDetailScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Detalle" back={true} />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
