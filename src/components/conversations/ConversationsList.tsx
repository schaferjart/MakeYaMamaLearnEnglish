import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConversationEntry } from "@/lib/api";
import { MessageCircle, Calendar, Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";
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

  const handleDelete = async (sessionId: string) => {
    // TODO: Implement delete functionality for entire session
    console.log('Delete conversation session:', sessionId);
    setDeleteConfirm(null);
    onRefresh();
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Group conversations by session_id
  const groupedConversations = conversations.reduce((groups, conversation) => {
    const sessionId = conversation.session_id || 'no-session';
    if (!groups[sessionId]) {
      groups[sessionId] = [];
    }
    groups[sessionId].push(conversation);
    return groups;
  }, {} as Record<string, ConversationEntry[]>);

  // Sort sessions by most recent conversation
  const sortedSessions = Object.entries(groupedConversations).sort(([, a], [, b]) => {
    const latestA = Math.max(...a.map(c => new Date(c.created_at || 0).getTime()));
    const latestB = Math.max(...b.map(c => new Date(c.created_at || 0).getTime()));
    return latestB - latestA;
  });

  const extractAllMessages = (sessionEntries: ConversationEntry[]) => {
    const allMessages: Array<{ content: string, role: 'user' | 'ai', timestamp: string, hasTranscript?: boolean }> = [];
    
    // Sort entries by created_at
    const sortedEntries = [...sessionEntries].sort((a, b) => 
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    sortedEntries.forEach(entry => {
      // Extract messages from JSON
      if (entry.messages_jsonb && Array.isArray(entry.messages_jsonb)) {
        entry.messages_jsonb.forEach(msg => {
          if (msg.role && msg.content) {
            allMessages.push({
              content: msg.content,
              role: msg.role === 'user' ? 'user' : 'ai',
              timestamp: entry.created_at || '',
              hasTranscript: !!entry.transcript_text
            });
          }
        });
      }
      
      // Also add transcript if it exists and doesn't duplicate messages
      if (entry.transcript_text && !entry.messages_jsonb) {
        allMessages.push({
          content: entry.transcript_text,
          role: 'user', // Transcripts are usually user speech
          timestamp: entry.created_at || '',
          hasTranscript: true
        });
      }
    });

    return allMessages;
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            {t('conversations.headerTitle')}
            <Badge variant="outline" className="ml-auto">
              {t('conversations.sessions', { count: sortedSessions.length })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedSessions.map(([sessionId, sessionEntries]) => {
              const messages = extractAllMessages(sessionEntries);
              const latestEntry = sessionEntries.reduce((latest, current) => 
                new Date(current.created_at || 0) > new Date(latest.created_at || 0) 
                  ? current : latest
              );
              
              return (
                <div
                  key={sessionId}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Session Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-muted-foreground">
                          {t('conversations.session')}: {sessionId === 'no-session' ? t('conversations.noSession') : sessionId.slice(0, 12) + '...'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('conversations.messages', { count: sessionEntries.length })}
                        </div>
                      </div>

                      {/* Messages Display */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {messages.slice(0, 6).map((message, index) => (
                          <div
                            key={index}
                            className={`rounded-md p-3 border-l-4 ${
                              message.role === 'user'
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-muted/50 border-muted/60'
                            }`}
                          >
                            <p className="text-sm">
                              <span className="font-medium">
                                {message.role === 'user' ? `${t('conversations.you')}: ` : `${t('conversations.aiTutor')}: `}
                              </span>
                              {truncateText(message.content, 150)}
                              {message.hasTranscript && (
                                <span className="ml-2 text-xs text-accent-foreground bg-accent/20 px-1 rounded">
                                  🎤
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                        {messages.length > 6 && (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            {t('conversations.moreMessages', { count: messages.length - 6 })}
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {latestEntry.created_at ? 
                            format(new Date(latestEntry.created_at), 'dd.MM.yyyy HH:mm') : 
                            t('conversations.unknown')
                          }
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      {deleteConfirm === sessionId ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(sessionId)}
                          >
                            {t('delete')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            {t('cancel')}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(sessionId)}
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