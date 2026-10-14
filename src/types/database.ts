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
      study_plans: {
        Row: {
          id: string;
          user_id: string;
          exam: string;
          exam_date: string;
          study_days: number[];
          questions_per_day: number;
          mock_day: number | null;
          mock_size: number | null;
          focus_specialties: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam: string;
          exam_date: string;
          study_days: number[];
          questions_per_day?: number;
          mock_day?: number | null;
          mock_size?: number | null;
          focus_specialties?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          exam?: string;
          exam_date?: string;
          study_days?: number[];
          questions_per_day?: number;
          mock_day?: number | null;
          mock_size?: number | null;
          focus_specialties?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      study_tasks: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          scheduled_date: string;
          task_type: "practice" | "mock_exam" | "review";
          phase: "foundation" | "reinforcement" | "final_review";
          specialty: string | null;
          question_count: number;
          completed: boolean;
          completed_at: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          user_id: string;
          scheduled_date: string;
          task_type: "practice" | "mock_exam" | "review";
          phase: "foundation" | "reinforcement" | "final_review";
          specialty?: string | null;
          question_count: number;
          completed?: boolean;
          completed_at?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      cases: {
        Row: {
          id: string; patient_id: string | null; owner_id: string;
          mode: string; status: string; chief_complaint: string | null;
          history_json: Record<string, unknown> | null; consent_at: string | null;
          model_version: string; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; patient_id?: string | null; owner_id: string;
          mode?: string; status?: string; chief_complaint?: string | null;
          history_json?: Record<string, unknown> | null; consent_at?: string | null;
          model_version?: string; created_at?: string; updated_at?: string;
        };
        Update: {
          status?: string; chief_complaint?: string | null;
          history_json?: Record<string, unknown> | null; updated_at?: string;
        };
        Relationships: [];
      };
      case_images: {
        Row: {
          id: string; case_id: string; storage_path: string;
          body_site: string | null; view: string | null; captured_at: string | null;
          quality_json: Record<string, unknown> | null; faces_blurred: boolean; created_at: string;
        };
        Insert: {
          id?: string; case_id: string; storage_path: string;
          body_site?: string | null; view?: string | null; captured_at?: string | null;
          quality_json?: Record<string, unknown> | null; faces_blurred?: boolean;
        };
        Update: { quality_json?: Record<string, unknown> | null; faces_blurred?: boolean };
        Relationships: [];
      };
      case_documents: {
        Row: {
          id: string; case_id: string; storage_path: string;
          doc_type: string | null; ocr_engine: string | null; ocr_confidence: number | null; created_at: string;
        };
        Insert: {
          id?: string; case_id: string; storage_path: string;
          doc_type?: string | null; ocr_engine?: string | null; ocr_confidence?: number | null;
        };
        Update: { ocr_engine?: string | null; ocr_confidence?: number | null };
        Relationships: [];
      };
      case_extracted_values: {
        Row: {
          id: string; document_id: string; loinc: string | null; name: string;
          value: string; unit: string | null; ref_range: string | null; flag: string | null;
          observed_at: string | null; confidence: number | null; confirmed_by: string | null; page: number | null;
        };
        Insert: {
          id?: string; document_id: string; loinc?: string | null; name: string;
          value: string; unit?: string | null; ref_range?: string | null; flag?: string | null;
          observed_at?: string | null; confidence?: number | null; confirmed_by?: string | null; page?: number | null;
        };
        Update: { confirmed_by?: string | null };
        Relationships: [];
      };
      case_analyses: {
        Row: {
          id: string; case_id: string; findings_json: Record<string, unknown> | null;
          differential_json: Record<string, unknown>[] | null; urgency: string | null;
          agreement: number | null; abstained: boolean; prompt_version: string;
          tokens: number | null; latency_ms: number | null; created_at: string;
        };
        Insert: {
          id?: string; case_id: string; findings_json?: Record<string, unknown> | null;
          differential_json?: Record<string, unknown>[] | null; urgency?: string | null;
          agreement?: number | null; abstained?: boolean; prompt_version?: string;
          tokens?: number | null; latency_ms?: number | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      case_reports: {
        Row: {
          id: string; analysis_id: string; lang: string; audience: string;
          content_json: Record<string, unknown>; pdf_path: string | null;
          released_at: string | null; signed_by: string | null; created_at: string;
        };
        Insert: {
          id?: string; analysis_id: string; lang?: string; audience?: string;
          content_json: Record<string, unknown>; pdf_path?: string | null;
        };
        Update: { pdf_path?: string | null; released_at?: string | null; signed_by?: string | null };
        Relationships: [];
      };
      case_feedback: {
        Row: {
          id: string; case_id: string; final_diagnosis_icd: string | null;
          confirmation: string | null; verdict: string | null; notes: string | null; created_at: string;
        };
        Insert: {
          id?: string; case_id: string; final_diagnosis_icd?: string | null;
          confirmation?: string | null; verdict?: string | null; notes?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      case_audit_log: {
        Row: {
          id: string; case_id: string; actor_id: string | null;
          action: string; at: string; ip_hash: string | null;
        };
        Insert: {
          id?: string; case_id: string; actor_id?: string | null;
          action: string; ip_hash?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      case_jobs: {
        Row: {
          id: string; case_id: string; document_id: string | null;
          status: string; attempts: number; error: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; case_id: string; document_id?: string | null;
          status?: string; attempts?: number; error?: string | null;
        };
        Update: { status?: string; attempts?: number; error?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience type aliases
export type StudyPlan = Database["public"]["Tables"]["study_plans"]["Row"];
export type StudyTask = Database["public"]["Tables"]["study_tasks"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AccessRequest = Database["public"]["Tables"]["access_requests"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionAttempt = Database["public"]["Tables"]["question_attempts"]["Row"];
export type MockExam = Database["public"]["Tables"]["mock_exams"]["Row"];
export type MockExamQuestion = Database["public"]["Tables"]["mock_exam_questions"]["Row"];
export type MockAnswer = Database["public"]["Tables"]["mock_answers"]["Row"];
export type AiConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type AiMessage = Database["public"]["Tables"]["ai_messages"]["Row"];
