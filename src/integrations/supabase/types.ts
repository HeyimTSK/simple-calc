export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      financial_profiles: {
        Row: {
          id: string
          user_id: string
          monthly_salary: number | null
          rent: number | null
          food: number | null
          utilities: number | null
          family_support: number | null
          existing_loans: number | null
          emi_amount: number | null
          savings: number | null
          investments: number | null
          investment_types: string[] | null
          insurance_type: string | null
          dependents: number | null
          has_emergency_fund: boolean | null
          emergency_fund_amount: number | null
          current_age: number | null
          retirement_age: number | null
          life_expectancy: number | null
          risk_profile: string | null
          onboarding_completed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          monthly_salary?: number | null
          rent?: number | null
          food?: number | null
          utilities?: number | null
          family_support?: number | null
          existing_loans?: number | null
          emi_amount?: number | null
          savings?: number | null
          investments?: number | null
          investment_types?: string[] | null
          insurance_type?: string | null
          dependents?: number | null
          has_emergency_fund?: boolean | null
          emergency_fund_amount?: number | null
          current_age?: number | null
          retirement_age?: number | null
          life_expectancy?: number | null
          risk_profile?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          monthly_salary?: number | null
          rent?: number | null
          food?: number | null
          utilities?: number | null
          family_support?: number | null
          existing_loans?: number | null
          emi_amount?: number | null
          savings?: number | null
          investments?: number | null
          investment_types?: string[] | null
          insurance_type?: string | null
          dependents?: number | null
          has_emergency_fund?: boolean | null
          emergency_fund_amount?: number | null
          current_age?: number | null
          retirement_age?: number | null
          life_expectancy?: number | null
          risk_profile?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      family_members: {
        Row: {
          id: string
          user_id: string
          relation: string
          name: string
          age: number | null
          monthly_income: number | null
          monthly_expenses: number | null
          investments: number | null
          insurance_type: string | null
          education_goal: string | null
          education_target_year: number | null
          monthly_medical_expense: number | null
          has_health_insurance: boolean | null
          dependency_level: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          relation: string
          name: string
          age?: number | null
          monthly_income?: number | null
          monthly_expenses?: number | null
          investments?: number | null
          insurance_type?: string | null
          education_goal?: string | null
          education_target_year?: number | null
          monthly_medical_expense?: number | null
          has_health_insurance?: boolean | null
          dependency_level?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          relation?: string
          name?: string
          age?: number | null
          monthly_income?: number | null
          monthly_expenses?: number | null
          investments?: number | null
          insurance_type?: string | null
          education_goal?: string | null
          education_target_year?: number | null
          monthly_medical_expense?: number | null
          has_health_insurance?: boolean | null
          dependency_level?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      assets: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          current_value: number | null
          owner: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          current_value?: number | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string
          current_value?: number | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      liabilities: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          outstanding: number | null
          emi: number | null
          interest_rate: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          outstanding?: number | null
          emi?: number | null
          interest_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string
          outstanding?: number | null
          emi?: number | null
          interest_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          target_year: number
          current_cost: number | null
          inflation_rate: number | null
          expected_return: number | null
          current_savings: number | null
          monthly_contribution: number | null
          linked_member_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          target_year: number
          current_cost?: number | null
          inflation_rate?: number | null
          expected_return?: number | null
          current_savings?: number | null
          monthly_contribution?: number | null
          linked_member_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string
          target_year?: number
          current_cost?: number | null
          inflation_rate?: number | null
          expected_return?: number | null
          current_savings?: number | null
          monthly_contribution?: number | null
          linked_member_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          date: string
          category: string
          amount: number | null
          note: string | null
          payment_method: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          category: string
          amount?: number | null
          note?: string | null
          payment_method?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          category?: string
          amount?: number | null
          note?: string | null
          payment_method?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
> = DefaultSchemaTableNameOrOptions extends {
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
