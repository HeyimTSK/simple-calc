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
          created_at: string
          current_value: number
          id: string
          name: string
          notes: string | null
          owner: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          id?: string
          name: string
          notes?: string | null
          owner?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          name?: string
          notes?: string | null
          owner?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          note: string | null
          payment_method: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          payment_method?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          payment_method?: string | null
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          age: number
          created_at: string
          dependency_level: string | null
          education_goal: string | null
          education_target_year: number | null
          has_health_insurance: boolean
          id: string
          insurance_type: string
          investments: number
          monthly_expenses: number
          monthly_income: number
          monthly_medical_expense: number
          name: string
          relation: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number
          created_at?: string
          dependency_level?: string | null
          education_goal?: string | null
          education_target_year?: number | null
          has_health_insurance?: boolean
          id?: string
          insurance_type?: string
          investments?: number
          monthly_expenses?: number
          monthly_income?: number
          monthly_medical_expense?: number
          name: string
          relation: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string
          dependency_level?: string | null
          education_goal?: string | null
          education_target_year?: number | null
          has_health_insurance?: boolean
          id?: string
          insurance_type?: string
          investments?: number
          monthly_expenses?: number
          monthly_income?: number
          monthly_medical_expense?: number
          name?: string
          relation?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          created_at: string
          current_age: number
          dependents: number
          emergency_fund_amount: number
          emi_amount: number
          existing_loans: number
          family_support: number
          food: number
          has_emergency_fund: boolean
          id: string
          insurance_type: string
          investment_types: string[]
          investments: number
          life_expectancy: number
          monthly_salary: number
          onboarding_completed: boolean
          rent: number
          retirement_age: number
          risk_profile: string
          savings: number
          updated_at: string
          user_id: string
          utilities: number
        }
        Insert: {
          created_at?: string
          current_age?: number
          dependents?: number
          emergency_fund_amount?: number
          emi_amount?: number
          existing_loans?: number
          family_support?: number
          food?: number
          has_emergency_fund?: boolean
          id?: string
          insurance_type?: string
          investment_types?: string[]
          investments?: number
          life_expectancy?: number
          monthly_salary?: number
          onboarding_completed?: boolean
          rent?: number
          retirement_age?: number
          risk_profile?: string
          savings?: number
          updated_at?: string
          user_id: string
          utilities?: number
        }
        Update: {
          created_at?: string
          current_age?: number
          dependents?: number
          emergency_fund_amount?: number
          emi_amount?: number
          existing_loans?: number
          family_support?: number
          food?: number
          has_emergency_fund?: boolean
          id?: string
          insurance_type?: string
          investment_types?: string[]
          investments?: number
          life_expectancy?: number
          monthly_salary?: number
          onboarding_completed?: boolean
          rent?: number
          retirement_age?: number
          risk_profile?: string
          savings?: number
          updated_at?: string
          user_id?: string
          utilities?: number
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          current_cost: number
          current_savings: number
          expected_return: number
          id: string
          inflation_rate: number
          linked_member_id: string | null
          monthly_contribution: number
          name: string
          notes: string | null
          target_year: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_cost?: number
          current_savings?: number
          expected_return?: number
          id?: string
          inflation_rate?: number
          linked_member_id?: string | null
          monthly_contribution?: number
          name: string
          notes?: string | null
          target_year: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_cost?: number
          current_savings?: number
          expected_return?: number
          id?: string
          inflation_rate?: number
          linked_member_id?: string | null
          monthly_contribution?: number
          name?: string
          notes?: string | null
          target_year?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_linked_member_id_fkey"
            columns: ["linked_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      liabilities: {
        Row: {
          created_at: string
          emi: number
          id: string
          interest_rate: number
          name: string
          notes: string | null
          outstanding: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emi?: number
          id?: string
          interest_rate?: number
          name: string
          notes?: string | null
          outstanding?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emi?: number
          id?: string
          interest_rate?: number
          name?: string
          notes?: string | null
          outstanding?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
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
