import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { ContactsListScreen } from '../screens/ContactsListScreen';

const Stack = createNativeStackNavigator();

export const ContactsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ContactsList"
        component={ContactsListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Mis Contactos"
              back={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
