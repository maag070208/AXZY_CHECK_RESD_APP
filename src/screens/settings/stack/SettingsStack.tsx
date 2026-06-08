import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { SettingsListScreen } from '../screens/SettingsListScreen';

const Stack = createNativeStackNavigator();

export const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsList"
        component={SettingsListScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Catálogos del Sistema" back={true} />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
