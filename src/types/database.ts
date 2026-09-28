export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "admin";
export type AccessStatus = "pending" | "active" | "suspended" | "expired";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "draft" | "published" | "archived";
export type CorrectAnswer = "A" | "B" | "C" | "D";
export type AccessRequestStatus = "new" | "contacted" | "paid" | "approved" | "rejected";
export type MessageRole = "user" | "assistant" | "system";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          phone: string | null;
          role: UserRole;
          target_exam: string | null;
          exam_date: string | null;
          access_status: AccessStatus;
          access_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          phone?: string | null;
          role?: UserRole;
          target_exam?: string | null;
          exam_date?: string | null;
          access_status?: AccessStatus;
          access_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string;
          phone?: string | null;
          role?: UserRole;
          target_exam?: string | null;
          exam_date?: string | null;
          access_status?: AccessStatus;
          access_expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          target_exam: string | null;
          expected_exam_date: string | null;
          notes: string | null;
          status: AccessRequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          target_exam?: string | null;
          expected_exam_date?: string | null;
          notes?: string | null;
          status?: AccessRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string | null;
          target_exam?: string | null;
          expected_exam_date?: string | null;
          notes?: string | null;
          status?: AccessRequestStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_answer: CorrectAnswer;
          justification: string | null;
          explanation_a: string | null;
          explanation_b: string | null;
          explanation_c: string | null;
          explanation_d: string | null;
          exam: string | null;
          category: string | null;
          topic: string | null;
          subtopic: string | null;
          difficulty: Difficulty;
          year: number | null;
          source: string | null;
          status: QuestionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_answer: CorrectAnswer;
          justification?: string | null;
          explanation_a?: string | null;
          explanation_b?: string | null;
          explanation_c?: string | null;
          explanation_d?: string | null;
          exam?: string | null;
          category?: string | null;
          topic?: string | null;
          subtopic?: string | null;
          difficulty?: Difficulty;
          year?: number | null;
          source?: string | null;
          status?: QuestionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          question_text?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_answer?: CorrectAnswer;
          justification?: string | null;
          explanation_a?: string | null;
          explanation_b?: string | null;
          explanation_c?: string | null;
          explanation_d?: string | null;
          exam?: string | null;
          category?: string | null;
          topic?: string | null;
          subtopic?: string | null;
          difficulty?: Difficulty;
          year?: number | null;
          source?: string | null;
          status?: QuestionStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      question_attempts: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          selected_answer: CorrectAnswer;
          is_correct: boolean;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          selected_answer: CorrectAnswer;
          is_correct: boolean;
          attempted_at?: string;
        };
        Update: {
          selected_answer?: CorrectAnswer;
          is_correct?: boolean;
        };
        Relationships: [];
      };
      mock_exams: {
        Row: {
          id: string;
          user_id: string;
          exam_name: string | null;
          started_at: string;
          completed_at: string | null;
          question_count: number;
          score: number | null;
          percentage: number | null;
          duration_seconds: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_name?: string | null;
          started_at?: string;
          completed_at?: string | null;
          question_count: number;
          score?: number | null;
          percentage?: number | null;
          duration_seconds?: number | null;
        };
        Update: {
          completed_at?: string | null;
          score?: number | null;
          percentage?: number | null;
          duration_seconds?: number | null;
        };
        Relationships: [];
      };
      mock_exam_questions: {
        Row: {
          id: string;
          mock_exam_id: string;
          question_id: string;
          position: number;
          flagged: boolean;
        };
        Insert: {
          id?: string;
          mock_exam_id: string;
          question_id: string;
          position: number;
          flagged?: boolean;
        };
        Update: {
          flagged?: boolean;
        };
        Relationships: [];
      };
      mock_answers: {
        Row: {
          id: string;
          mock_exam_id: string;
          question_id: string;
          selected_answer: CorrectAnswer | null;
          is_correct: boolean | null;
        };
        Insert: {
          id?: string;
          mock_exam_id: string;
          question_id: string;
          selected_answer?: CorrectAnswer | null;
          is_correct?: boolean | null;
        };
        Update: {
          selected_answer?: CorrectAnswer | null;
          is_correct?: boolean | null;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          question_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          question_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          role?: MessageRole;
          content?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AccessRequest = Database["public"]["Tables"]["access_requests"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionAttempt = Database["public"]["Tables"]["question_attempts"]["Row"];
export type MockExam = Database["public"]["Tables"]["mock_exams"]["Row"];
export type MockExamQuestion = Database["public"]["Tables"]["mock_exam_questions"]["Row"];
export type MockAnswer = Database["public"]["Tables"]["mock_answers"]["Row"];
export type AiConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type AiMessage = Database["public"]["Tables"]["ai_messages"]["Row"];
