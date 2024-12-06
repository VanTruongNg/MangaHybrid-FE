import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { handleInitializeSocket, handleNewNotification, handleNewMessage } from '@/lib/socket-handlers';
import { socket } from '@/lib/socket';
import type { Notification, PublicMessage } from '@/types/socket';

export function useSocket() {
  const { user } = useAuthStore();
  const { 
    setUnreadNotifications, 
    setPublicMessages,
    setNotifications,
  } = useNotificationStore();

  const handlersRef = useRef<(() => void)[]>([]);

  const handleInitialData = useCallback(({ 
    unreadNotifications,
    publicMessages 
  }: {
    unreadNotifications: Notification[];
    publicMessages: PublicMessage[];
  }) => {
    setUnreadNotifications(unreadNotifications);
    setPublicMessages(publicMessages);
  }, [setUnreadNotifications, setPublicMessages]);

  const handleNotification = useCallback((notification: Notification) => {
    console.log('[Socket] Received notification:', notification);
    setUnreadNotifications((prev) => [notification, ...prev]);
    setNotifications((prev) => prev.length > 0 ? [notification, ...prev] : prev);
  }, [setUnreadNotifications, setNotifications]);

  const handleMessage = useCallback((message: PublicMessage) => {
    console.log('[Socket] Received new message:', message);
    setPublicMessages((prev) => [...prev, message]);
  }, [setPublicMessages]);

  const setupSocketHandlers = useCallback(() => {
    handlersRef.current.forEach(cleanup => cleanup());
    handlersRef.current = [];

    const unsubscribeInitial = handleInitializeSocket(handleInitialData);
    const unsubscribeNotification = handleNewNotification(handleNotification);
    const unsubscribeMessage = handleNewMessage(handleMessage);

    handlersRef.current = [
      unsubscribeInitial, 
      unsubscribeNotification,
      unsubscribeMessage
    ];
  }, [handleInitialData, handleNotification, handleMessage]);

  useEffect(() => {
    if (!user) return;

    const handleConnect = () => {
      setupSocketHandlers();
    };

    if (socket.connected) {
      setupSocketHandlers();
    }

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
      handlersRef.current.forEach(cleanup => cleanup());
      handlersRef.current = [];
    };
  }, [user, setupSocketHandlers]);
} 