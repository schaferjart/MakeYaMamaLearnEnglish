import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConversationEntry } from "@/lib/api";
import { MessageCircle, Calendar, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { VocabularyPanel } from '@/components/VocabularyPanel';

interface ConversationsListProps {
  conversations: ConversationEntry[];
  onRefresh: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onRefresh
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | undefined>(undefined);

  const handleDelete = async (sessionId: string) => {
    // TODO: Implement delete functionality for entire session
    console.log('Delete conversation session:', sessionId);
    setDeleteConfirm(null);
    onRefresh();
  };

  const handleTextSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const selectedString = selection?.toString().trim();

    if (selection && selectedString && selectedString.length > 0 && selectedString.length < 300) {
      // Find the session container to get the book_id
      const sessionElement = (event.target as HTMLElement).closest('[data-book-id]');
      const bookId = sessionElement?.getAttribute('data-book-id') || undefined;

      setSelectedText(selectedString);
      setCurrentBookId(bookId);
      setShowVocabulary(true);
    }
  };

  const handleCloseVocabulary = () => {
    setShowVocabulary(false);
    setSelectedText("");
    setCurrentBookId(undefined);
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
            Gespräche mit dem AI Tutor
            <Badge variant="outline" className="ml-auto">
              {sortedSessions.length} Sessions
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
              const bookId = sessionEntries[0]?.sessions?.book_id || undefined;

              return (
                <div
                  key={sessionId}
                  className="p-4 hover:bg-muted/30 transition-colors"
                  data-book-id={bookId}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Session Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-muted-foreground">
                          Session: {sessionId === 'no-session' ? 'Ohne Session' : sessionId.slice(0, 12) + '...'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sessionEntries.length} Nachrichten
                        </div>
                      </div>

                      {/* Messages Display */}
                      <div className="space-y-2 max-h-64 overflow-y-auto" onMouseUp={handleTextSelection}>
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
                                {message.role === 'user' ? 'Du: ' : 'AI Tutor: '}
                              </span>
                              {truncateText(message.content, 500)}
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
                            ... und {messages.length - 6} weitere Nachrichten
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {latestEntry.created_at ? 
                            format(new Date(latestEntry.created_at), 'dd.MM.yyyy HH:mm') : 
                            'Unbekannt'
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
      {showVocabulary && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VocabularyPanel
            selectedText={selectedText}
            bookId={currentBookId}
            onClose={handleCloseVocabulary}
          />
        </div>
      )}
    </div>
  );
};