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
      ad_units: {
        Row: {
          container_id: string | null
          created_at: string
          enabled: boolean
          format: string
          height: number | null
          id: string
          label: string
          notes: string | null
          provider: string
          raw_html: string | null
          script_url: string | null
          slot: string
          sort_order: number
          target_url: string | null
          updated_at: string
          width: number | null
          zone_key: string | null
        }
        Insert: {
          container_id?: string | null
          created_at?: string
          enabled?: boolean
          format: string
          height?: number | null
          id?: string
          label: string
          notes?: string | null
          provider?: string
          raw_html?: string | null
          script_url?: string | null
          slot: string
          sort_order?: number
          target_url?: string | null
          updated_at?: string
          width?: number | null
          zone_key?: string | null
        }
        Update: {
          container_id?: string | null
          created_at?: string
          enabled?: boolean
          format?: string
          height?: number | null
          id?: string
          label?: string
          notes?: string | null
          provider?: string
          raw_html?: string | null
          script_url?: string | null
          slot?: string
          sort_order?: number
          target_url?: string | null
          updated_at?: string
          width?: number | null
          zone_key?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          locale: string
          plan: Database["public"]["Enums"]["plan_tier"]
          plan_expiry: string | null
          pref_age_max: number | null
          pref_age_min: number | null
          pref_district: string | null
          pref_education: string | null
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          locale?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          plan_expiry?: string | null
          pref_age_max?: number | null
          pref_age_min?: number | null
          pref_district?: string | null
          pref_education?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          locale?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          plan_expiry?: string | null
          pref_age_max?: number | null
          pref_age_min?: number | null
          pref_district?: string | null
          pref_education?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      cta_clicks: {
        Row: {
          clicked_at: string
          cta_link_id: string | null
          id: string
          kind: Database["public"]["Enums"]["cta_kind"]
          profile_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          cta_link_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["cta_kind"]
          profile_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          cta_link_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["cta_kind"]
          profile_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cta_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["cta_kind"]
          label: string
          profile_id: string | null
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["cta_kind"]
          label?: string
          profile_id?: string | null
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["cta_kind"]
          label?: string
          profile_id?: string | null
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      favourites: {
        Row: {
          created_at: string
          profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "patri_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "patri_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      patri_profiles: {
        Row: {
          about: string | null
          age: number
          ancestral_address: string | null
          children_info: string | null
          country: string | null
          created_at: string
          current_location: string | null
          district: string | null
          education: string | null
          expectations: string | null
          family_type: Database["public"]["Enums"]["family_type"] | null
          father_profession: string | null
          height_cm: number | null
          id: string
          income_range: string | null
          is_published: boolean
          locale: string
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          mother_profession: string | null
          name: string
          photos: string[]
          profession: string | null
          region: string
          religion: string | null
          sect: string | null
          siblings_count: number | null
          skin_tone: Database["public"]["Enums"]["skin_tone"] | null
          slug: string | null
          updated_at: string
          visit_note: string | null
          weight_kg: number | null
        }
        Insert: {
          about?: string | null
          age: number
          ancestral_address?: string | null
          children_info?: string | null
          country?: string | null
          created_at?: string
          current_location?: string | null
          district?: string | null
          education?: string | null
          expectations?: string | null
          family_type?: Database["public"]["Enums"]["family_type"] | null
          father_profession?: string | null
          height_cm?: number | null
          id?: string
          income_range?: string | null
          is_published?: boolean
          locale?: string
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mother_profession?: string | null
          name: string
          photos?: string[]
          profession?: string | null
          region?: string
          religion?: string | null
          sect?: string | null
          siblings_count?: number | null
          skin_tone?: Database["public"]["Enums"]["skin_tone"] | null
          slug?: string | null
          updated_at?: string
          visit_note?: string | null
          weight_kg?: number | null
        }
        Update: {
          about?: string | null
          age?: number
          ancestral_address?: string | null
          children_info?: string | null
          country?: string | null
          created_at?: string
          current_location?: string | null
          district?: string | null
          education?: string | null
          expectations?: string | null
          family_type?: Database["public"]["Enums"]["family_type"] | null
          father_profession?: string | null
          height_cm?: number | null
          id?: string
          income_range?: string | null
          is_published?: boolean
          locale?: string
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mother_profession?: string | null
          name?: string
          photos?: string[]
          profession?: string | null
          region?: string
          religion?: string | null
          sect?: string | null
          siblings_count?: number | null
          skin_tone?: Database["public"]["Enums"]["skin_tone"] | null
          slug?: string | null
          updated_at?: string
          visit_note?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          reviewed_at: string | null
          reviewed_by: string | null
          sender_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
          txn_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          txn_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          txn_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unlocks: {
        Row: {
          paid_at: string
          profile_id: string
          user_id: string
        }
        Insert: {
          paid_at?: string
          profile_id: string
          user_id: string
        }
        Update: {
          paid_at?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "patri_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bn_to_latin: { Args: { _s: string }; Returns: string }
      generate_profile_slug: {
        Args: { _age: number; _district: string; _id: string; _name: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      cta_kind:
        | "whatsapp"
        | "imo"
        | "messenger"
        | "facebook"
        | "call"
        | "custom"
        | "telegram"
      family_type: "nuclear" | "joint"
      marital_status: "never" | "divorced" | "widowed"
      payment_status: "pending" | "approved" | "rejected"
      plan_tier: "free" | "ad_free" | "explorer"
      skin_tone: "fair" | "medium" | "wheatish" | "dark"
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
      app_role: ["admin", "user"],
      cta_kind: [
        "whatsapp",
        "imo",
        "messenger",
        "facebook",
        "call",
        "custom",
        "telegram",
      ],
      family_type: ["nuclear", "joint"],
      marital_status: ["never", "divorced", "widowed"],
      payment_status: ["pending", "approved", "rejected"],
      plan_tier: ["free", "ad_free", "explorer"],
      skin_tone: ["fair", "medium", "wheatish", "dark"],
    },
  },
} as const
