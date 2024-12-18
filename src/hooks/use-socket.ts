import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { useChatStore } from '@/store/chat.store';
import { useChatUIStore } from '@/store/chat-ui.store';
import { 
  handleInitializeSocket, 
  handleNewNotification, 
  handleNewMessage, 
  handleMessageError, 
  handleMessageAck,
  handleNewPrivateMessage,
  handleRoomUpdate,
  handleOpenedPrivateRoom
} from '@/lib/socket-handlers';
import { socket } from '@/lib/socket';
import type { 
  Notification, 
  PublicMessage, 
  MessageWithTempId, 
  MessageError, 
  MessageAckResponse, 
  PrivateMessageEvent, 
  ChatMessage, 
  PrivateRoom
} from '@/types/socket';

export function useSocket() {
  const { user } = useAuthStore();
  const { 
    setUnreadNotifications, 
    setNotifications,
  } = useNotificationStore();
  const { setPublicMessages } = useChatStore();

  const handlersRef = useRef<(() => void)[]>([]);

  const handleInitialData = useCallback(({ 
    rooms,
    publicMessages, 
    unreadNotifications 
  }: {
    rooms: PrivateRoom[];
    publicMessages: PublicMessage[];
    unreadNotifications: Notification[];
  }) => {
    useChatStore.getState().setPrivateRooms(rooms);
    useChatStore.getState().setPublicMessages(publicMessages);
    useNotificationStore.getState().setUnreadNotifications(unreadNotifications);
  }, []);

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
    if (ack.room) {
      const chatStore = useChatStore.getState();
      const chatUIStore = useChatUIStore.getState();
      const activeChat = chatUIStore.activePrivateChat;
      
      chatStore.upsertPrivateRoom(ack.room);
      
      if (activeChat?.type === 'virtual') {
        const virtualRoomId = `virtual_${activeChat.id}`;
        chatStore.updateTempPrivateMessage(virtualRoomId, ack.tempId, { isSending: false });
        chatStore.migrateVirtualMessages(virtualRoomId, ack.room._id);
        chatUIStore.openExistingRoom(ack.room._id);
      } else {
        chatStore.updateTempPrivateMessage(ack.room._id, ack.tempId, { isSending: false });
        chatStore.addPrivateMessage(ack.room._id, ack.message as ChatMessage);
      }
      chatStore.sortRoomsByLatestMessage();
    } else {
      useChatStore.getState().updateMessageFromAck(ack.tempId, ack.message as PublicMessage);
    }
  }, []);

  const handleNewPrivateMessageCallback = useCallback((data: PrivateMessageEvent) => {
    const chatStore = useChatStore.getState();
    const chatUIStore = useChatUIStore.getState();
    
    chatStore.upsertPrivateRoom(data.room);
    chatStore.addPrivateMessage(data.room._id, data.message);
    chatStore.sortRoomsByLatestMessage();

    const activeChat = chatUIStore.activePrivateChat;
    if (activeChat?.type === 'virtual') {
      const senderId = data.message.sender._id;
      if (activeChat.id === senderId) {
        chatUIStore.openExistingRoom(data.room._id);
      }
    }
  }, []);

  const handleRoomUpdateCallback = useCallback((data: { rooms: PrivateRoom[] }) => {
    const chatStore = useChatStore.getState();
    
    chatStore.setPrivateRooms(data.rooms);
    
    chatStore.sortRoomsByLatestMessage();
  }, []);

  const handleOpenedPrivateRoomCallback = useCallback((data: {
    roomId: string;
    messages: ChatMessage[];
  }) => {
    useChatStore.getState().setPrivateMessages(data.roomId, data.messages);
  }, []);

  const setupSocketHandlers = useCallback(() => {
    handlersRef.current.forEach(cleanup => cleanup());
    handlersRef.current = [];

    const unsubscribeInitial = handleInitializeSocket(handleInitialData);
    const unsubscribeNotification = handleNewNotification(handleNotification);
    const unsubscribeMessage = handleNewMessage(handleMessage);
    const unsubscribeError = handleMessageError(handleError);
    const unsubscribeAck = handleMessageAck(messageAckCallback);
    const unsubNewPrivate = handleNewPrivateMessage(handleNewPrivateMessageCallback);
    const unsubRoomUpdate = handleRoomUpdate(handleRoomUpdateCallback);
    const unsubOpenedRoom = handleOpenedPrivateRoom(handleOpenedPrivateRoomCallback);

    handlersRef.current = [
      unsubscribeInitial, 
      unsubscribeNotification,
      unsubscribeMessage,
      unsubscribeError,
      unsubscribeAck,
      unsubNewPrivate,
      unsubRoomUpdate,
      unsubOpenedRoom
    ];
  }, [
    handleInitialData, 
    handleNotification, 
    handleMessage, 
    handleError, 
    messageAckCallback,
    handleNewPrivateMessageCallback,
    handleRoomUpdateCallback,
    handleOpenedPrivateRoomCallback
  ]);

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