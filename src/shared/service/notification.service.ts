import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
    return true;
  } catch {
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch {
    return null;
  }
};

export const onForegroundMessage = (
  handler: (remoteMessage: any) => void,
): (() => void) => {
  return messaging().onMessage(handler);
};

export const onBackgroundMessage = (
  handler: (remoteMessage: any) => Promise<any>,
) => {
  messaging().setBackgroundMessageHandler(handler);
};

export const onTokenRefresh = (handler: (token: string) => void) => {
  return messaging().onTokenRefresh(handler);
};
