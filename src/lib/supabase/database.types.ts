// Generat cu „pnpm db:types” din baza de date. Nu edita manual.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      attendance_meetings: {
        Row: {
          class_id: string;
          date: string;
          id: string;
          lesson_id: string | null;
          topic: string;
        };
        ComputedFields: never;
        Insert: {
          class_id: string;
          date: string;
          id?: string;
          lesson_id?: string | null;
          topic?: string;
        };
        Update: {
          class_id?: string;
          date?: string;
          id?: string;
          lesson_id?: string | null;
          topic?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_meetings_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_meetings_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance_records: {
        Row: {
          meeting_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          meeting_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
        };
        Update: {
          meeting_id?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_records_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "attendance_meetings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      class_members: {
        Row: {
          class_id: string;
          joined_at: string;
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          class_id: string;
          joined_at?: string;
          student_id: string;
        };
        Update: {
          class_id?: string;
          joined_at?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_members_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          invite_code: string;
          invite_code_active: boolean;
          mentor_id: string;
          name: string;
          schedule: string;
          status: Database["public"]["Enums"]["class_status"];
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          invite_code?: string;
          invite_code_active?: boolean;
          mentor_id: string;
          name: string;
          schedule?: string;
          status?: Database["public"]["Enums"]["class_status"];
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          invite_code?: string;
          invite_code_active?: boolean;
          mentor_id?: string;
          name?: string;
          schedule?: string;
          status?: Database["public"]["Enums"]["class_status"];
        };
        Relationships: [
          {
            foreignKeyName: "classes_mentor_id_fkey";
            columns: ["mentor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          accent: string;
          author_id: string;
          class_id: string | null;
          created_at: string;
          description: string;
          id: string;
          level: string;
          position: number;
          slug: string;
          status: Database["public"]["Enums"]["publication_status"];
          subtitle: string;
          title: string;
          topic: string;
        };
        ComputedFields: never;
        Insert: {
          accent?: string;
          author_id: string;
          class_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          level?: string;
          position?: number;
          slug: string;
          status?: Database["public"]["Enums"]["publication_status"];
          subtitle?: string;
          title: string;
          topic?: string;
        };
        Update: {
          accent?: string;
          author_id?: string;
          class_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          level?: string;
          position?: number;
          slug?: string;
          status?: Database["public"]["Enums"]["publication_status"];
          subtitle?: string;
          title?: string;
          topic?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "courses_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
      };
      homework_assignments: {
        Row: {
          assigned_at: string;
          class_id: string;
          deadline: string | null;
          homework_id: string;
          id: string;
          max_bonus_xp: number;
        };
        ComputedFields: never;
        Insert: {
          assigned_at?: string;
          class_id: string;
          deadline?: string | null;
          homework_id: string;
          id?: string;
          max_bonus_xp?: number;
        };
        Update: {
          assigned_at?: string;
          class_id?: string;
          deadline?: string | null;
          homework_id?: string;
          id?: string;
          max_bonus_xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: "homework_assignments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "homework_assignments_homework_id_fkey";
            columns: ["homework_id"];
            isOneToOne: false;
            referencedRelation: "homeworks";
            referencedColumns: ["id"];
          },
        ];
      };
      homework_problems: {
        Row: {
          homework_id: string;
          id: string;
          language: string;
          position: number;
          required: boolean;
          starter: string | null;
          statement: string;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          homework_id: string;
          id?: string;
          language?: string;
          position?: number;
          required?: boolean;
          starter?: string | null;
          statement?: string;
          title: string;
        };
        Update: {
          homework_id?: string;
          id?: string;
          language?: string;
          position?: number;
          required?: boolean;
          starter?: string | null;
          statement?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homework_problems_homework_id_fkey";
            columns: ["homework_id"];
            isOneToOne: false;
            referencedRelation: "homeworks";
            referencedColumns: ["id"];
          },
        ];
      };
      homework_reviews: {
        Row: {
          assignment_id: string;
          bonus_xp: number;
          note: string | null;
          reviewed_at: string;
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          assignment_id: string;
          bonus_xp: number;
          note?: string | null;
          reviewed_at?: string;
          student_id: string;
        };
        Update: {
          assignment_id?: string;
          bonus_xp?: number;
          note?: string | null;
          reviewed_at?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homework_reviews_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "homework_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "homework_reviews_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      homeworks: {
        Row: {
          archived: boolean;
          author_id: string;
          created_at: string;
          description: string;
          id: string;
          required: boolean;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          archived?: boolean;
          author_id: string;
          created_at?: string;
          description?: string;
          id?: string;
          required?: boolean;
          title: string;
        };
        Update: {
          archived?: boolean;
          author_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          required?: boolean;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homeworks_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_classes: {
        Row: {
          added_at: string;
          class_id: string;
          display: Database["public"]["Enums"]["lesson_display"];
          lesson_id: string;
          number: number;
          published: boolean;
        };
        ComputedFields: never;
        Insert: {
          added_at?: string;
          class_id: string;
          display?: Database["public"]["Enums"]["lesson_display"];
          lesson_id: string;
          number: number;
          published?: boolean;
        };
        Update: {
          added_at?: string;
          class_id?: string;
          display?: Database["public"]["Enums"]["lesson_display"];
          lesson_id?: string;
          number?: number;
          published?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_classes_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_classes_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_items: {
        Row: {
          content: NonNullable<Json>;
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["item_kind"];
          lesson_id: string;
          position: number;
          published: boolean;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          content?: NonNullable<Json>;
          created_at?: string;
          id?: string;
          kind: Database["public"]["Enums"]["item_kind"];
          lesson_id: string;
          position?: number;
          published?: boolean;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: NonNullable<Json>;
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["item_kind"];
          lesson_id?: string;
          position?: number;
          published?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_items_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          author_id: string;
          course_id: string | null;
          created_at: string;
          duration_min: number | null;
          id: string;
          parent_id: string | null;
          position: number;
          slug: string | null;
          summary: string;
          title: string;
        };
        ComputedFields: never;
        Insert: {
          author_id: string;
          course_id?: string | null;
          created_at?: string;
          duration_min?: number | null;
          id?: string;
          parent_id?: string | null;
          position?: number;
          slug?: string | null;
          summary?: string;
          title: string;
        };
        Update: {
          author_id?: string;
          course_id?: string | null;
          created_at?: string;
          duration_min?: number | null;
          id?: string;
          parent_id?: string | null;
          position?: number;
          slug?: string | null;
          summary?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      live_answers: {
        Row: {
          answer: number;
          answered_at: string;
          correct: boolean;
          points: number;
          position: number;
          session_id: string;
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          answer: number;
          answered_at?: string;
          correct: boolean;
          points: number;
          position: number;
          session_id: string;
          student_id: string;
        };
        Update: {
          answer?: number;
          answered_at?: string;
          correct?: boolean;
          points?: number;
          position?: number;
          session_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_answers_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_answers_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      live_players: {
        Row: {
          joined_at: string;
          session_id: string;
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          joined_at?: string;
          session_id: string;
          student_id: string;
        };
        Update: {
          joined_at?: string;
          session_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_players_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_players_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      live_results: {
        Row: {
          rank: number;
          score: number;
          session_id: string;
          student_id: string;
          xp: number;
        };
        ComputedFields: never;
        Insert: {
          rank: number;
          score?: number;
          session_id: string;
          student_id: string;
          xp?: number;
        };
        Update: {
          rank?: number;
          score?: number;
          session_id?: string;
          student_id?: string;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: "live_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_results_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      live_sessions: {
        Row: {
          class_id: string;
          code: string;
          created_at: string;
          created_by: string;
          current_question: number;
          ended_at: string | null;
          id: string;
          question_seconds: number;
          question_started_at: string | null;
          quiz_id: string;
          reveal: boolean;
          show_board: boolean;
          status: Database["public"]["Enums"]["live_status"];
          title: string;
        };
        ComputedFields: never;
        Insert: {
          class_id: string;
          code: string;
          created_at?: string;
          created_by: string;
          current_question?: number;
          ended_at?: string | null;
          id?: string;
          question_seconds?: number;
          question_started_at?: string | null;
          quiz_id: string;
          reveal?: boolean;
          show_board?: boolean;
          status?: Database["public"]["Enums"]["live_status"];
          title: string;
        };
        Update: {
          class_id?: string;
          code?: string;
          created_at?: string;
          created_by?: string;
          current_question?: number;
          ended_at?: string | null;
          id?: string;
          question_seconds?: number;
          question_started_at?: string | null;
          quiz_id?: string;
          reveal?: boolean;
          show_board?: boolean;
          status?: Database["public"]["Enums"]["live_status"];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_sessions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_sessions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_sessions_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      mentor_applications: {
        Row: {
          background: string;
          email: string;
          evidence: string;
          full_name: string;
          id: string;
          intended_use: string;
          phone: string;
          review_note: string | null;
          status: Database["public"]["Enums"]["application_status"];
          submitted_at: string;
        };
        ComputedFields: never;
        Insert: {
          background: string;
          email: string;
          evidence?: string;
          full_name: string;
          id?: string;
          intended_use: string;
          phone: string;
          review_note?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string;
        };
        Update: {
          background?: string;
          email?: string;
          evidence?: string;
          full_name?: string;
          id?: string;
          intended_use?: string;
          phone?: string;
          review_note?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          at: string;
          body: string;
          href: string;
          id: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          read: boolean;
          title: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          body?: string;
          href?: string;
          id?: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          read?: boolean;
          title: string;
          user_id: string;
        };
        Update: {
          at?: string;
          body?: string;
          href?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["notification_kind"];
          read?: boolean;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      problem_attempts: {
        Row: {
          at: string;
          code: string;
          id: string;
          late: boolean;
          submission_id: string;
        };
        ComputedFields: never;
        Insert: {
          at?: string;
          code: string;
          id?: string;
          late?: boolean;
          submission_id: string;
        };
        Update: {
          at?: string;
          code?: string;
          id?: string;
          late?: boolean;
          submission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problem_attempts_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "problem_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      problem_submissions: {
        Row: {
          assignment_id: string;
          feedback: string | null;
          feedback_at: string | null;
          id: string;
          problem_id: string;
          status: Database["public"]["Enums"]["problem_status"];
          student_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          assignment_id: string;
          feedback?: string | null;
          feedback_at?: string | null;
          id?: string;
          problem_id: string;
          status?: Database["public"]["Enums"]["problem_status"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          assignment_id?: string;
          feedback?: string | null;
          feedback_at?: string | null;
          id?: string;
          problem_id?: string;
          status?: Database["public"]["Enums"]["problem_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problem_submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "homework_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "problem_submissions_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "homework_problems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "problem_submissions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar: string | null;
          created_at: string;
          display_name: string;
          id: string;
          notification_prefs: NonNullable<Json>;
          role: Database["public"]["Enums"]["app_role"];
          status: Database["public"]["Enums"]["account_status"];
          username: string | null;
        };
        ComputedFields: never;
        Insert: {
          avatar?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          notification_prefs?: NonNullable<Json>;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["account_status"];
          username?: string | null;
        };
        Update: {
          avatar?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          notification_prefs?: NonNullable<Json>;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["account_status"];
          username?: string | null;
        };
        Relationships: [];
      };
      quiz_answer_keys: {
        Row: {
          correct: number;
          explanation: string | null;
          question_id: string;
        };
        ComputedFields: never;
        Insert: {
          correct: number;
          explanation?: string | null;
          question_id: string;
        };
        Update: {
          correct?: number;
          explanation?: string | null;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_answer_keys_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "quiz_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_assignments: {
        Row: {
          assigned_at: string;
          class_id: string;
          quiz_id: string;
        };
        ComputedFields: never;
        Insert: {
          assigned_at?: string;
          class_id: string;
          quiz_id: string;
        };
        Update: {
          assigned_at?: string;
          class_id?: string;
          quiz_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_assignments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_assignments_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempts: {
        Row: {
          answers: number[];
          at: string;
          correct: number;
          id: string;
          quiz_id: string;
          results: NonNullable<Json>;
          student_id: string;
          total: number;
        };
        ComputedFields: never;
        Insert: {
          answers?: number[];
          at?: string;
          correct: number;
          id?: string;
          quiz_id: string;
          results?: NonNullable<Json>;
          student_id: string;
          total: number;
        };
        Update: {
          answers?: number[];
          at?: string;
          correct?: number;
          id?: string;
          quiz_id?: string;
          results?: NonNullable<Json>;
          student_id?: string;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_lessons: {
        Row: {
          lesson_id: string;
          quiz_id: string;
        };
        ComputedFields: never;
        Insert: {
          lesson_id: string;
          quiz_id: string;
        };
        Update: {
          lesson_id?: string;
          quiz_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_lessons_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_lessons_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_questions: {
        Row: {
          code: string | null;
          id: string;
          lesson_id: string | null;
          options: string[];
          position: number;
          prompt: string;
          quiz_id: string;
          time_sec: number;
        };
        ComputedFields: never;
        Insert: {
          code?: string | null;
          id?: string;
          lesson_id?: string | null;
          options: string[];
          position: number;
          prompt: string;
          quiz_id: string;
          time_sec?: number;
        };
        Update: {
          code?: string | null;
          id?: string;
          lesson_id?: string | null;
          options?: string[];
          position?: number;
          prompt?: string;
          quiz_id?: string;
          time_sec?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quizzes: {
        Row: {
          author_id: string;
          course_id: string | null;
          created_at: string;
          description: string;
          id: string;
          kind: Database["public"]["Enums"]["quiz_kind"];
          live: boolean;
          time_limit_sec: number | null;
          title: string;
          xp: number;
        };
        ComputedFields: never;
        Insert: {
          author_id: string;
          course_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["quiz_kind"];
          live?: boolean;
          time_limit_sec?: number | null;
          title: string;
          xp?: number;
        };
        Update: {
          author_id?: string;
          course_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["quiz_kind"];
          live?: boolean;
          time_limit_sec?: number | null;
          title?: string;
          xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quizzes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      xp_transactions: {
        Row: {
          amount: number;
          at: string;
          class_id: string | null;
          created_by: string | null;
          event_key: string | null;
          id: string;
          label: string;
          source: Database["public"]["Enums"]["xp_source"];
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          at?: string;
          class_id?: string | null;
          created_by?: string | null;
          event_key?: string | null;
          id?: string;
          label: string;
          source: Database["public"]["Enums"]["xp_source"];
          student_id: string;
        };
        Update: {
          amount?: number;
          at?: string;
          class_id?: string | null;
          created_by?: string | null;
          event_key?: string | null;
          id?: string;
          label?: string;
          source?: Database["public"]["Enums"]["xp_source"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "xp_transactions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "xp_transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "xp_transactions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      adjust_xp: {
        Args: {
          p_amount: number;
          p_class: string;
          p_label: string;
          p_student: string;
        };
        Returns: undefined;
      };
      answer_live: {
        Args: { p_answer: number; p_position: number; p_session: string };
        Returns: undefined;
      };
      class_leaderboard: {
        Args: { p_class: string };
        Returns: {
          avatar: string;
          display_name: string;
          rank: number;
          student_id: string;
          xp: number;
        }[];
      };
      class_quiz_mastery: {
        Args: { p_class: string };
        Returns: {
          correct: number;
          display_name: string;
          lesson_id: string;
          lesson_title: string;
          student_id: string;
          total: number;
        }[];
      };
      create_live_session: {
        Args: { p_class: string; p_quiz: string };
        Returns: string;
      };
      email_taken: { Args: { p_email: string }; Returns: boolean };
      join_class: { Args: { p_code: string }; Returns: string };
      join_live: { Args: { p_code: string }; Returns: string };
      live_control: {
        Args: { p_action: string; p_session: string };
        Returns: undefined;
      };
      live_state: { Args: { p_session: string }; Returns: Json };
      review_problem: {
        Args: {
          p_feedback: string;
          p_status: Database["public"]["Enums"]["problem_status"];
          p_submission: string;
        };
        Returns: undefined;
      };
      set_attendance: {
        Args: { p_meeting: string; p_records: Json };
        Returns: undefined;
      };
      set_homework_bonus: {
        Args: {
          p_assignment: string;
          p_bonus: number;
          p_note: string;
          p_student: string;
        };
        Returns: undefined;
      };
      submit_problem: {
        Args: { p_assignment: string; p_code: string; p_problem: string };
        Returns: string;
      };
      submit_quiz: {
        Args: { p_answers: number[]; p_quiz: string };
        Returns: Json;
      };
    };
    Enums: {
      account_status: "active" | "suspended" | "deactivated";
      app_role: "student" | "mentor" | "admin";
      application_status: "pending" | "approved" | "rejected" | "needs_info";
      assignment_type: "required" | "optional";
      attendance_status: "present" | "absent" | "recovered";
      class_status: "active" | "archived";
      item_kind: "article" | "pdf" | "link" | "video" | "problem";
      lesson_display: "number" | "title" | "both";
      live_status: "scheduled" | "lobby" | "running" | "ended";
      material_kind: "article" | "pdf" | "link" | "video";
      notification_kind:
        | "assignment_new"
        | "deadline"
        | "feedback"
        | "needs_changes"
        | "material_new"
        | "live_quiz"
        | "submission_new"
        | "resubmission"
        | "application";
      problem_status: "submitted" | "accepted" | "needs_changes";
      publication_status: "published" | "draft";
      quiz_kind: "lesson" | "recap" | "practice";
      submission_status: "submitted" | "reviewed" | "needs_changes";
      xp_source:
        | "attendance"
        | "submission"
        | "quality_bonus"
        | "live_quiz"
        | "practice_quiz"
        | "adjustment"
        | "class_quiz";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "deactivated"],
      app_role: ["student", "mentor", "admin"],
      application_status: ["pending", "approved", "rejected", "needs_info"],
      assignment_type: ["required", "optional"],
      attendance_status: ["present", "absent", "recovered"],
      class_status: ["active", "archived"],
      item_kind: ["article", "pdf", "link", "video", "problem"],
      lesson_display: ["number", "title", "both"],
      live_status: ["scheduled", "lobby", "running", "ended"],
      material_kind: ["article", "pdf", "link", "video"],
      notification_kind: [
        "assignment_new",
        "deadline",
        "feedback",
        "needs_changes",
        "material_new",
        "live_quiz",
        "submission_new",
        "resubmission",
        "application",
      ],
      problem_status: ["submitted", "accepted", "needs_changes"],
      publication_status: ["published", "draft"],
      quiz_kind: ["lesson", "recap", "practice"],
      submission_status: ["submitted", "reviewed", "needs_changes"],
      xp_source: [
        "attendance",
        "submission",
        "quality_bonus",
        "live_quiz",
        "practice_quiz",
        "adjustment",
        "class_quiz",
      ],
    },
  },
} as const;
