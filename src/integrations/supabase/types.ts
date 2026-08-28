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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          hours: number
          id: string
          user_id: string
          weekday: number
        }
        Insert: {
          hours?: number
          id?: string
          user_id: string
          weekday: number
        }
        Update: {
          hours?: number
          id?: string
          user_id?: string
          weekday?: number
        }
        Relationships: []
      }
      availability_exceptions: {
        Row: {
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          id: string
          start_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      planning_versions: {
        Row: {
          created_at: string
          id: string
          note: string | null
          reason: string
          summary: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          reason?: string
          summary?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          reason?: string
          summary?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          autonomy: string
          created_at: string
          goal: string | null
          goal_detail: string | null
          id: string
          name: string
          onboarding_completed: boolean
          preferences: Json
          self_assessment: Json
          updated_at: string
        }
        Insert: {
          autonomy?: string
          created_at?: string
          goal?: string | null
          goal_detail?: string | null
          id: string
          name?: string
          onboarding_completed?: boolean
          preferences?: Json
          self_assessment?: Json
          updated_at?: string
        }
        Update: {
          autonomy?: string
          created_at?: string
          goal?: string | null
          goal_detail?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean
          preferences?: Json
          self_assessment?: Json
          updated_at?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          seconds: number | null
          selected_index: number
          topic_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          seconds?: number | null
          selected_index: number
          topic_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          seconds?: number | null
          selected_index?: number
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          area: string
          correct_index: number
          created_at: string
          difficulty: number
          exam_id: string | null
          explanation: string | null
          id: string
          institution: string | null
          options: Json
          source: string | null
          statement: string
          subject_id: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          area?: string
          correct_index?: number
          created_at?: string
          difficulty?: number
          exam_id?: string | null
          explanation?: string | null
          id?: string
          institution?: string | null
          options?: Json
          source?: string | null
          statement: string
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          area?: string
          correct_index?: number
          created_at?: string
          difficulty?: number
          exam_id?: string | null
          explanation?: string | null
          id?: string
          institution?: string | null
          options?: Json
          source?: string | null
          statement?: string
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "target_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_activities: {
        Row: {
          actual_minutes: number | null
          completed_at: string | null
          created_at: string
          date: string
          detail: string | null
          end_time: string
          exam_id: string | null
          id: string
          planned_minutes: number
          planning_version_id: string | null
          priority: string
          rationale: string | null
          start_time: string
          started_at: string | null
          status: string
          subject_id: string | null
          title: string
          topic_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          date: string
          detail?: string | null
          end_time: string
          exam_id?: string | null
          id?: string
          planned_minutes?: number
          planning_version_id?: string | null
          priority?: string
          rationale?: string | null
          start_time: string
          started_at?: string | null
          status?: string
          subject_id?: string | null
          title: string
          topic_id?: string | null
          type?: string
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          date?: string
          detail?: string | null
          end_time?: string
          exam_id?: string | null
          id?: string
          planned_minutes?: number
          planning_version_id?: string | null
          priority?: string
          rationale?: string | null
          start_time?: string
          started_at?: string | null
          status?: string
          subject_id?: string | null
          title?: string
          topic_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_activities_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "target_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_activities_planning_version_id_fkey"
            columns: ["planning_version_id"]
            isOneToOne: false
            referencedRelation: "planning_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_activities_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_activities_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          area: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          area?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      target_exams: {
        Row: {
          created_at: string
          exam_date: string | null
          id: string
          institution: string | null
          name: string
          priority: string
          specialty: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          id?: string
          institution?: string | null
          name: string
          priority?: string
          specialty?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          id?: string
          institution?: string | null
          name?: string
          priority?: string
          specialty?: string | null
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          difficulty: number
          id: string
          last_studied_at: string | null
          mastery: number | null
          name: string
          next_review_at: string | null
          subject_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          id?: string
          last_studied_at?: string | null
          mastery?: number | null
          name: string
          next_review_at?: string | null
          subject_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          id?: string
          last_studied_at?: string | null
          mastery?: number | null
          name?: string
          next_review_at?: string | null
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
