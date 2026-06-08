import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { PaymentDetailScreen } from '../screens/PaymentDetailScreen';
import { PaymentReceiptScreen } from '../screens/PaymentReceiptScreen';
import { PaymentsListScreen } from '../screens/PaymentsListScreen';

const Stack = createNativeStackNavigator();

export const PaymentsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PAYMENTS_LIST"
        component={PaymentsListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Pagos" back={true} />
          ),
        })}
      />
      <Stack.Screen
        name="PAYMENT_DETAIL"
        component={PaymentDetailScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Detalle del Pago"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="PAYMENT_RECEIPT"
        component={PaymentReceiptScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
