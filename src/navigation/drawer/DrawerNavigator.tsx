import { createDrawerNavigator } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DRAWER_WHITELIST } from '../../core/constants/navigation.constants';
import { LocationsStack } from '../../screens/locations/stack/LocationsStack';
import { GuardsStack } from '../../screens/guards/stack/GuardsStack';
import { AssignmentsStack } from '../../screens/assignments/stack/AssignmentsStack';
import { UsersStack } from '../../screens/users/stack/UsersStack';
import TabNavigator from '../tabs/TabNavigator';
import DrawerContent from './DrawerContent';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { CheckStack } from '../../screens/check/stack/CheckStack';
import { IncidentsStack } from '../../screens/assignments/stack/IncidentsStack';
import { MaintenanceStack } from '../../screens/maintenances/stack/MaintenanceStack';
import { RoundsStack } from '../../screens/rounds/stack/RoundsStack';
import { SchedulesStack } from '../../screens/schedules/stack/SchedulesStack';
import { ResidencialStack as ResidencialesStack } from '../../screens/residenciales/stack/ResidencialStack';
import { ZonesStack } from '../../screens/zones/stack/ZonesStack';
import { RecurringStack } from '../../screens/recurring/stack/RecurringStack';
import { SyncScreen } from '../../screens/home/screens/SyncScreen';
import { SettingsStack } from '../../screens/settings/stack/SettingsStack';
import { ResidentsStack } from '../../screens/residents/stack/ResidentsStack';
import { PropertiesStack } from '../../screens/properties/stack/PropertiesStack';
import { AccessesStack } from '../../screens/accesses/stack/AccessesStack';
import { ComplaintsStack } from '../../screens/complaints/stack/ComplaintsStack';
import { PaymentsStack } from '../../screens/payments/stack/PaymentsStack';
import { FeesStack } from '../../screens/fees/stack/FeesStack';
import { ReportsStack } from '../../screens/reports/stack/ReportsStack';
import { ContactsStack } from '../../screens/contacts/stack/ContactsStack';

const Drawer = createDrawerNavigator();

const getActiveRouteName = (route: any): string => {
  const childName = getFocusedRouteNameFromRoute(route);

  if (!childName) {
    if (route.name === 'HOME_STACK') return 'HOME_MAIN';
    if (route.name === 'LOCATIONS_STACK') return 'LOCATIONS_MAIN';
    if (route.name === 'PROFILE_SCREEN') return 'PROFILE_MAIN';
    if (route.name === 'CLIENTS_STACK') return 'CLIENTS_MAIN';
    if (route.name === 'ZONES_STACK') return 'ZONES_MAIN';
    if (route.name === 'Tabs') return 'HOME_MAIN';
    if (route.name === 'RESIDENTS_STACK') return 'RESIDENTS_LIST';
    if (route.name === 'PROPERTIES_STACK') return 'PROPERTIES_LIST';
    if (route.name === 'ACCESSES_STACK') return 'ACCESSES_LIST';
    if (route.name === 'COMPLAINTS_STACK') return 'COMPLAINTS_LIST';
    if (route.name === 'PAYMENTS_STACK') return 'PAYMENTS_LIST';
    if (route.name === 'FEES_STACK') return 'FEES_LIST';
    if (route.name === 'REPORTS_STACK') return 'REPORTS_LIST';
    if (route.name === 'SETTINGS_STACK') return 'SETTINGS_LIST';
    if (route.name === 'CONTACTS_STACK') return 'CONTACTS_LIST';
    return route.name;
  }

  const childRoute = route.state?.routes?.find(
    (r: any) => r.name === childName,
  );
  if (childRoute) {
    return getActiveRouteName(childRoute);
  }

  return childName;
};

const isDrawerEnabled = (route: any) => {
  const routeName = getActiveRouteName(route);
  return DRAWER_WHITELIST.includes(routeName);
};

// Wrapper para TabNavigator con SafeAreaInsets
const TabNavigatorWithSafeArea = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 },
      ]}
    >
      <TabNavigator />
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: Platform.OS === 'ios' ? 280 : 260,
        },
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        drawerType: Platform.OS === 'android' ? 'front' : 'slide',
        swipeEdgeWidth: Platform.OS === 'android' ? 20 : 30,
      }}
      drawerContent={props => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigatorWithSafeArea}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      <Drawer.Screen
        name="CHECK_STACK"
        component={CheckStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="SYNC_SCREEN"
        component={SyncScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="LOCATIONS_STACK"
        component={LocationsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      <Drawer.Screen
        name="GUARDS_STACK"
        component={GuardsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      <Drawer.Screen
        name="ASSIGNMENTS_STACK"
        component={AssignmentsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      <Drawer.Screen
        name="USERS_STACK"
        component={UsersStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      <Drawer.Screen
        name="CLIENTS_STACK"
        component={ResidencialesStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="ZONES_STACK"
        component={ZonesStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="PROFILE_SCREEN"
        component={ProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="INCIDENTS_STACK"
        component={IncidentsStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="MAINTENANCE_STACK"
        component={MaintenanceStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="ROUNDS_STACK"
        component={RoundsStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="SCHEDULES_STACK"
        component={SchedulesStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="RECURRING_STACK"
        component={RecurringStack}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      {/* === NEW ADMIN MODULES === */}
      <Drawer.Screen
        name="RESIDENTS_STACK"
        component={ResidentsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="PROPERTIES_STACK"
        component={PropertiesStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="ACCESSES_STACK"
        component={AccessesStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="COMPLAINTS_STACK"
        component={ComplaintsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="PAYMENTS_STACK"
        component={PaymentsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="FEES_STACK"
        component={FeesStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="REPORTS_STACK"
        component={ReportsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="SETTINGS_STACK"
        component={SettingsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
      <Drawer.Screen
        name="CONTACTS_STACK"
        component={ContactsStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
});

export default DrawerNavigator;
