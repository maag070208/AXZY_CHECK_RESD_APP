import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PropertiesListScreen } from '../screens/PropertiesListScreen';
import { PropertyFormScreen } from '../screens/PropertyFormScreen';
import { HeaderBack } from '../../../navigation/header/HeaderBack';

const Stack = createNativeStackNavigator();

export const PropertiesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PROPERTIES_LIST"
        component={PropertiesListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Gestión de Propiedades"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="PROPERTY_FORM"
        component={PropertyFormScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
