import { useState, useEffect } from 'react';
import { getUserConversations, ConversationEntry } from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export const useConversations = (bookId?: string) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserConversations(bookId);
      setConversations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      toast({
        title: "Failed to load conversations",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user, bookId]);

  const refreshConversations = () => {
    loadConversations();
  };

  return {
    conversations,
    isLoading,
    error,
    refreshConversations
  };
};