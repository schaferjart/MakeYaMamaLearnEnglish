export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      book_progress: {
        Row: {
          book_id: string
          last_cfi: string | null
          percent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          last_cfi?: string | null
          percent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          last_cfi?: string | null
          percent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          cover_url: string | null
          created_at: string | null
          epub_path: string | null
          id: string
          opf_json: Json | null
          source: string | null
          title: string
          year: number | null
          language_code: string
          title_original: string | null
          author_original: string | null
        }
        Insert: {
          author: string
          cover_url?: string | null
          created_at?: string | null
          epub_path?: string | null
          id?: string
          opf_json?: Json | null
          source?: string | null
          title: string
          year?: number | null
          language_code?: string
          title_original?: string | null
          author_original?: string | null
        }
        Update: {
          author?: string
          cover_url?: string | null
          created_at?: string | null
          epub_path?: string | null
          id?: string
          opf_json?: Json | null
          source?: string | null
          title?: string
          year?: number | null
          language_code?: string
          title_original?: string | null
          author_original?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          messages_jsonb: Json | null
          session_id: string | null
          transcript_text: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages_jsonb?: Json | null
          session_id?: string | null
          transcript_text?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages_jsonb?: Json | null
          session_id?: string | null
          transcript_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cefr_level: string | null
          created_at: string | null
          id: string
          locale: string | null
          updated_at: string | null
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string | null
          id: string
          locale?: string | null
          updated_at?: string | null
        }
        Update: {
          cefr_level?: string | null
          created_at?: string | null
          id?: string
          locale?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          created_at: string
          current_position: number
          id: string
          last_read_at: string
          progress_percentage: number
          reading_speed_wpm: number | null
          session_id: string | null
          time_spent_seconds: number | null
          total_length: number | null
          updated_at: string
          user_id: string
          words_read: number | null
          chapter_id: string | null
          last_sentence_index: number | null
        }
        Insert: {
          book_id: string
          created_at?: string
          current_position?: number
          id?: string
          last_read_at?: string
          progress_percentage?: number
          reading_speed_wpm?: number | null
          session_id?: string | null
          time_spent_seconds?: number | null
          total_length?: number | null
          updated_at?: string
          user_id: string
          words_read?: number | null
          chapter_id?: string | null
          last_sentence_index?: number | null
        }
        Update: {
          book_id?: string
          created_at?: string
          current_position?: number
          id?: string
          last_read_at?: string
          progress_percentage?: number
          reading_speed_wpm?: number | null
          session_id?: string | null
          time_spent_seconds?: number | null
          total_length?: number | null
          updated_at?: string
          user_id?: string
          words_read?: number | null
          chapter_id?: string | null
          last_sentence_index?: number | null
        }
        Relationships: []
      }
      reading_statistics: {
        Row: {
          average_speed_wpm: number | null
          books_completed: number | null
          books_started: number | null
          created_at: string
          date: string
          id: string
          pages_read: number
          sessions_count: number
          total_time_seconds: number
          updated_at: string
          user_id: string
          words_read: number
        }
        Insert: {
          average_speed_wpm?: number | null
          books_completed?: number | null
          books_started?: number | null
          created_at?: string
          date: string
          id?: string
          pages_read?: number
          sessions_count?: number
          total_time_seconds?: number
          updated_at?: string
          user_id: string
          words_read?: number
        }
        Update: {
          average_speed_wpm?: number | null
          books_completed?: number | null
          books_started?: number | null
          created_at?: string
          date?: string
          id?: string
          pages_read?: number
          sessions_count?: number
          total_time_seconds?: number
          updated_at?: string
          user_id?: string
          words_read?: number
        }
        Relationships: []
      }
      sessions: {
        Row: {
          book_id: string | null
          ended_at: string | null
          id: string
          read_ms: number | null
          started_at: string | null
          talk_ms: number | null
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          ended_at?: string | null
          id?: string
          read_ms?: number | null
          started_at?: string | null
          talk_ms?: number | null
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          ended_at?: string | null
          id?: string
          read_ms?: number | null
          started_at?: string | null
          talk_ms?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_language_pairs: {
        Row: {
          id: string
          user_id: string
          source_language: string
          target_language: string
          is_active: boolean
          proficiency_level: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_language: string
          target_language: string
          is_active?: boolean
          proficiency_level?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_language?: string
          target_language?: string
          is_active?: boolean
          proficiency_level?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_language_pairs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary: {
        Row: {
          book_id: string | null
          cfi: string | null
          created_at: string | null
          difficulty: number | null
          example: string | null
          headword: string
          id: string
          lemma: string | null
          pos: string | null
          sense: string | null
          synonym: string | null
          translation_de: string | null
          translation_en: string | null
          translation_fr: string | null
          translation_hi: string | null
          user_id: string | null
          source_language: string
          target_language: string | null
        }
        Insert: {
          book_id?: string | null
          cfi?: string | null
          created_at?: string | null
          difficulty?: number | null
          example?: string | null
          headword: string
          id?: string
          lemma?: string | null
          pos?: string | null
          sense?: string | null
          synonym?: string | null
          translation_de?: string | null
          translation_en?: string | null
          translation_fr?: string | null
          translation_hi?: string | null
          user_id?: string | null
          source_language?: string
          target_language?: string | null
        }
        Update: {
          book_id?: string | null
          cfi?: string | null
          created_at?: string | null
          difficulty?: number | null
          example?: string | null
          headword?: string
          id?: string
          lemma?: string | null
          pos?: string | null
          sense?: string | null
          synonym?: string | null
          translation_de?: string | null
          translation_en?: string | null
          translation_fr?: string | null
          translation_hi?: string | null
          user_id?: string | null
          source_language?: string
          target_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
