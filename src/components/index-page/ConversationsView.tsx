import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { t } from '@/lib/i18n';
import { ConversationsList } from '@/components/conversations/ConversationsList';
import type { ConversationEntry } from '@/lib/api';

interface ConversationsViewProps {
  conversations: ConversationEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenLibrary: () => void;
}

export const ConversationsView = ({
  conversations,
  isLoading,
  onRefresh,
  onOpenLibrary,
}: ConversationsViewProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('conversations.empty.title')}</h3>
        <p className="text-muted-foreground mb-4">{t('conversations.empty.description')}</p>
        <Button onClick={onOpenLibrary}>{t('common.toLibrary')}</Button>
      </Card>
    );
  }

  return <ConversationsList conversations={conversations} onRefresh={onRefresh} />;
};
