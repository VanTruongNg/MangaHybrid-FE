import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { handleInitializeSocket, handleNewNotification, handleNewMessage, handleMessageError, handleMessageAck } from '@/lib/socket-handlers';
import { socket } from '@/lib/socket';
import type { Notification, PublicMessage, MessageWithTempId, MessageError, MessageAckResponse } from '@/types/socket';
import { useChatStore } from '@/store/chat.store';

export function useSocket() {
  const { user } = useAuthStore();
  const { 
    setUnreadNotifications, 
    setNotifications,
  } = useNotificationStore();
  const { setPublicMessages } = useChatStore();

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
    setUnreadNotifications((prev) => [notification, ...prev]);
    setNotifications((prev) => prev.length > 0 ? [notification, ...prev] : prev);
  }, [setUnreadNotifications, setNotifications]);

  const handleMessage = useCallback((message: PublicMessage | MessageWithTempId) => {
    if ('tempId' in message) {
      const finalMessage: PublicMessage = {
        _id: message._id,
        content: message.content,
        sender: message.sender,
        createdAt: message.createdAt,
      };
      useChatStore.getState().updateMessageFromAck(message.tempId, finalMessage);
    } else {
      setPublicMessages((prev: PublicMessage[]) => [...prev, message]);
    }
  }, [setPublicMessages]);

  const handleError = useCallback((error: MessageError) => {
    useChatStore.getState().setMessageError(error.tempId, error.error);
  }, []);

  const messageAckCallback = useCallback((ack: MessageAckResponse) => {
    useChatStore.getState().updateMessageFromAck(ack.tempId, ack.message);
  }, []);

  const setupSocketHandlers = useCallback(() => {
    handlersRef.current.forEach(cleanup => cleanup());
    handlersRef.current = [];

    const unsubscribeInitial = handleInitializeSocket(handleInitialData);
    const unsubscribeNotification = handleNewNotification(handleNotification);
    const unsubscribeMessage = handleNewMessage(handleMessage);
    const unsubscribeError = handleMessageError(handleError);
    const unsubscribeAck = handleMessageAck(messageAckCallback);

    handlersRef.current = [
      unsubscribeInitial, 
      unsubscribeNotification,
      unsubscribeMessage,
      unsubscribeError,
      unsubscribeAck,
    ];
  }, [handleInitialData, handleNotification, handleMessage, handleError, messageAckCallback]);

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