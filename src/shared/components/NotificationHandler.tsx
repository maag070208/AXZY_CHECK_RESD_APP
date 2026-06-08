import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../../core/store/slices/toast.slice';
import {
  onForegroundMessage,
  onBackgroundMessage,
  requestNotificationPermission,
  getFCMToken,
} from '../service/notification.service';

export const NotificationHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      if (granted) {
        getFCMToken().then((token) => {
          if (token) {
            console.log('FCM Token:', token);
          }
        });
      }
    });

    onBackgroundMessage(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
      return Promise.resolve();
    });

    const unsubscribe = onForegroundMessage((remoteMessage) => {
      const title =
        remoteMessage.notification?.title ||
        remoteMessage.data?.title ||
        'Nueva notificación';
      const body =
        remoteMessage.notification?.body ||
        remoteMessage.data?.body ||
        '';
      dispatch(
        showToast({
          type: 'info',
          message: `${title}: ${body}`,
        }),
      );
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
};
