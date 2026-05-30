import React, { createContext, useContext, useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { useUser } from './UserContext';

interface NotificationContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        // OneSignal Initialization
        await OneSignal.init({
          appId: "f8e94584-73f0-4b26-b80f-d9d586b62e49",
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/push/onesignal/' },
        });

        setIsSupported(true);

        // Check subscription status
        const state = await OneSignal.Notifications.permission;
        setIsSubscribed(state);

        // Sync Supabase User ID to OneSignal External ID
        if (user?.id) {
          await OneSignal.login(user.id);
          console.log("OneSignal: User logged in as", user.id);
          
          // Optionally tag user with relevant data
          await OneSignal.User.addTag("name", user.name);
          await OneSignal.User.addTag("handle", user.handle);
        }
      } catch (error) {
        console.error("OneSignal Initialization Error:", error);
      }
    };

    initOneSignal();
  }, [user?.id]);

  const requestPermission = async () => {
    try {
      await OneSignal.Notifications.requestPermission();
      setIsSubscribed(true);
    } catch (error) {
      console.error("Permission request failed", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ isSupported, isSubscribed, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
