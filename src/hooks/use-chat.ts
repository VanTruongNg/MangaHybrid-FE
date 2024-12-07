import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { useChatStore } from '@/store/chat.store';
import { handleSendPublicMessage } from '@/lib/socket-handlers';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const { user } = useAuth();
  const { publicMessages, addTempMessage } = useChatStore();

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const tempId = uuidv4();
      
      addTempMessage({
        tempId,
        content,
        sender: {
          _id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        createdAt: new Date().toISOString(),
        isSending: true,
      });

      handleSendPublicMessage({ tempId, content });
      
      return { tempId, content };
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, [user, addTempMessage]);

  return {
    publicMessages,
    sendMessage,
  };
}; 