import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConversationEntry } from "@/lib/api";
import { MessageCircle, Calendar, Trash2 } from "lucide-react";
import { format } from 'date-fns';

interface ConversationsListProps {
  conversations: ConversationEntry[];
  onRefresh: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onRefresh
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (conversationId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete conversation:', conversationId);
    setDeleteConfirm(null);
    onRefresh();
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const extractMessages = (messagesJsonb: any): { user: string, ai: string } => {
    if (!messagesJsonb) return { user: '', ai: '' };
    
    // Try to extract messages from the JSON structure
    if (Array.isArray(messagesJsonb)) {
      const userMsg = messagesJsonb.find(m => m.role === 'user')?.content || '';
      const aiMsg = messagesJsonb.find(m => m.role === 'assistant')?.content || '';
      return { user: userMsg, ai: aiMsg };
    }
    
    return { user: '', ai: '' };
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            Gespräche mit dem AI Tutor
            <Badge variant="outline" className="ml-auto">
              {conversations.length} Gespräche
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {conversations.map((conversation) => {
              const messages = extractMessages(conversation.messages_jsonb);
              return (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Session Info */}
                      {conversation.session_id && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Session: {conversation.session_id.slice(0, 12)}...
                        </div>
                      )}

                      {/* Messages Preview */}
                      {messages.user && (
                        <div className="bg-primary/5 rounded-md p-3 border-l-4 border-primary/30">
                          <p className="text-sm font-medium text-foreground">
                            Du: {truncateText(messages.user)}
                          </p>
                        </div>
                      )}

                      {messages.ai && (
                        <div className="bg-muted/50 rounded-md p-3 border-l-4 border-muted/60">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">AI Tutor: </span>
                            {truncateText(messages.ai)}
                          </p>
                        </div>
                      )}

                      {/* Transcript if available */}
                      {conversation.transcript_text && (
                        <div className="bg-accent/10 rounded-md p-3 border-l-4 border-accent/30">
                          <p className="text-sm text-accent-foreground">
                            <span className="font-medium">Transkript: </span>
                            {truncateText(conversation.transcript_text)}
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {conversation.created_at ? 
                            format(new Date(conversation.created_at), 'dd.MM.yyyy HH:mm') : 
                            'Unbekannt'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      {deleteConfirm === conversation.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(conversation.id)}
                          >
                            Löschen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Abbrechen
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(conversation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};