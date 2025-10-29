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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      budget_categories: {
        Row: {
          budgeted_amount: number | null
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          priority: string | null
          spent_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budgeted_amount?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          priority?: string | null
          spent_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budgeted_amount?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          priority?: string | null
          spent_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_expenses: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          name: string
          receipt_url: string | null
          status: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          name: string
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          name?: string
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_options: {
        Row: {
          address: string | null
          category_id: string
          created_at: string
          email: string | null
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          phone: string | null
          price_max: number | null
          price_min: number | null
          rating: number | null
          status: string | null
          updated_at: string
          user_id: string
          vendor: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          category: string
          confirmed: boolean | null
          created_at: string
          dietary_restrictions: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          plus_one: boolean | null
          printed_invitation: boolean | null
          relationship: string | null
          side: string | null
          special_role: string | null
          table_number: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          confirmed?: boolean | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          printed_invitation?: boolean | null
          relationship?: string | null
          side?: string | null
          special_role?: string | null
          table_number?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          confirmed?: boolean | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          printed_invitation?: boolean | null
          relationship?: string | null
          side?: string | null
          special_role?: string | null
          table_number?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          scheduled_for: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          scheduled_for?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          scheduled_for?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string | null
          business_name: string
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          category: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          category: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          title: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          title?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          title?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          id: string
          notes: string | null
          service_id: string
          status: string | null
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          id?: string
          notes?: string | null
          service_id: string
          status?: string | null
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          service_id?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          partner_id: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          partner_id: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          partner_id?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_tasks: {
        Row: {
          category: string
          completed: boolean
          completed_date: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wedding_collaborators: {
        Row: {
          id: string
          invitation_accepted_at: string | null
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["wedding_role"]
          user_id: string
          wedding_id: string
        }
        Insert: {
          id?: string
          invitation_accepted_at?: string | null
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["wedding_role"]
          user_id: string
          wedding_id: string
        }
        Update: {
          id?: string
          invitation_accepted_at?: string | null
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["wedding_role"]
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_collaborators_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_data"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_data: {
        Row: {
          couple_name: string | null
          created_at: string
          estimated_budget: number | null
          event_code: string
          guest_count: number | null
          id: string
          is_setup_complete: boolean | null
          partner_name: string | null
          priorities: string[] | null
          region: string | null
          season: string | null
          style: string | null
          updated_at: string
          user_id: string
          wedding_date: string | null
        }
        Insert: {
          couple_name?: string | null
          created_at?: string
          estimated_budget?: number | null
          event_code: string
          guest_count?: number | null
          id?: string
          is_setup_complete?: boolean | null
          partner_name?: string | null
          priorities?: string[] | null
          region?: string | null
          season?: string | null
          style?: string | null
          updated_at?: string
          user_id: string
          wedding_date?: string | null
        }
        Update: {
          couple_name?: string | null
          created_at?: string
          estimated_budget?: number | null
          event_code?: string
          guest_count?: number | null
          id?: string
          is_setup_complete?: boolean | null
          partner_name?: string | null
          priorities?: string[] | null
          region?: string | null
          season?: string | null
          style?: string | null
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      wedding_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["wedding_role"]
          wedding_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by: string
          role?: Database["public"]["Enums"]["wedding_role"]
          wedding_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["wedding_role"]
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_invitations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_data"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invitation_token: { Args: never; Returns: string }
      get_user_wedding_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_wedding_collaborator: {
        Args: { _user_id: string; _wedding_id: string }
        Returns: boolean
      }
      is_wedding_owner: {
        Args: { _user_id: string; _wedding_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "partner" | "user"
      wedding_role:
        | "noivo"
        | "noiva"
        | "colaborador"
        | "celebrante"
        | "padrinho"
        | "madrinha"
        | "convidado"
        | "fotografo"
        | "organizador"
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
    Enums: {
      app_role: ["admin", "partner", "user"],
      wedding_role: [
        "noivo",
        "noiva",
        "colaborador",
        "celebrante",
        "padrinho",
        "madrinha",
        "convidado",
        "fotografo",
        "organizador",
      ],
    },
  },
} as const
