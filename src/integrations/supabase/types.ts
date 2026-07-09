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
      assets: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string
          name: string
          owner: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          name: string
          owner?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          name?: string
          owner?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string
          created_at: string | null
          date: string
          id: string
          note: string | null
          payment_method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          category: string
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          payment_method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          payment_method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          age: number | null
          created_at: string | null
          dependency_level: string | null
          education_goal: string | null
          education_target_year: number | null
          has_health_insurance: boolean | null
          id: string
          insurance_type: string | null
          investments: number | null
          monthly_expenses: number | null
          monthly_income: number | null
          monthly_medical_expense: number | null
          name: string
          relation: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          dependency_level?: string | null
          education_goal?: string | null
          education_target_year?: number | null
          has_health_insurance?: boolean | null
          id?: string
          insurance_type?: string | null
          investments?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_medical_expense?: number | null
          name: string
          relation: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          dependency_level?: string | null
          education_goal?: string | null
          education_target_year?: number | null
          has_health_insurance?: boolean | null
          id?: string
          insurance_type?: string | null
          investments?: number | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_medical_expense?: number | null
          name?: string
          relation?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          created_at: string | null
          current_age: number | null
          dependents: number | null
          emergency_fund_amount: number | null
          emi_amount: number | null
          existing_loans: number | null
          family_support: number | null
          food: number | null
          has_emergency_fund: boolean | null
          id: string
          insurance_type: string | null
          investment_types: string[] | null
          investments: number | null
          life_expectancy: number | null
          monthly_salary: number | null
          onboarding_completed: boolean | null
          rent: number | null
          retirement_age: number | null
          risk_profile: string | null
          savings: number | null
          updated_at: string | null
          user_id: string
          utilities: number | null
        }
        Insert: {
          created_at?: string | null
          current_age?: number | null
          dependents?: number | null
          emergency_fund_amount?: number | null
          emi_amount?: number | null
          existing_loans?: number | null
          family_support?: number | null
          food?: number | null
          has_emergency_fund?: boolean | null
          id?: string
          insurance_type?: string | null
          investment_types?: string[] | null
          investments?: number | null
          life_expectancy?: number | null
          monthly_salary?: number | null
          onboarding_completed?: boolean | null
          rent?: number | null
          retirement_age?: number | null
          risk_profile?: string | null
          savings?: number | null
          updated_at?: string | null
          user_id: string
          utilities?: number | null
        }
        Update: {
          created_at?: string | null
          current_age?: number | null
          dependents?: number | null
          emergency_fund_amount?: number | null
          emi_amount?: number | null
          existing_loans?: number | null
          family_support?: number | null
          food?: number | null
          has_emergency_fund?: boolean | null
          id?: string
          insurance_type?: string | null
          investment_types?: string[] | null
          investments?: number | null
          life_expectancy?: number | null
          monthly_salary?: number | null
          onboarding_completed?: boolean | null
          rent?: number | null
          retirement_age?: number | null
          risk_profile?: string | null
          savings?: number | null
          updated_at?: string | null
          user_id?: string
          utilities?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          current_cost: number | null
          current_savings: number | null
          expected_return: number | null
          id: string
          inflation_rate: number | null
          linked_member_id: string | null
          monthly_contribution: number | null
          name: string
          target_year: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_cost?: number | null
          current_savings?: number | null
          expected_return?: number | null
          id?: string
          inflation_rate?: number | null
          linked_member_id?: string | null
          monthly_contribution?: number | null
          name: string
          target_year: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_cost?: number | null
          current_savings?: number | null
          expected_return?: number | null
          id?: string
          inflation_rate?: number | null
          linked_member_id?: string | null
          monthly_contribution?: number | null
          name?: string
          target_year?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      liabilities: {
        Row: {
          created_at: string | null
          emi: number | null
          id: string
          interest_rate: number | null
          name: string
          outstanding: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emi?: number | null
          id?: string
          interest_rate?: number | null
          name: string
          outstanding?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emi?: number | null
          id?: string
          interest_rate?: number | null
          name?: string
          outstanding?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
