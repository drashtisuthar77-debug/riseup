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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bins: {
        Row: {
          address: string
          bin_code: string
          created_at: string
          fill_level: number
          id: string
          last_collected: string | null
          latitude: number
          longitude: number
          status: Database["public"]["Enums"]["bin_status"]
          type: Database["public"]["Enums"]["bin_type"]
          updated_at: string
          ward: string
          zone: string
        }
        Insert: {
          address: string
          bin_code: string
          created_at?: string
          fill_level?: number
          id?: string
          last_collected?: string | null
          latitude: number
          longitude: number
          status?: Database["public"]["Enums"]["bin_status"]
          type?: Database["public"]["Enums"]["bin_type"]
          updated_at?: string
          ward: string
          zone: string
        }
        Update: {
          address?: string
          bin_code?: string
          created_at?: string
          fill_level?: number
          id?: string
          last_collected?: string | null
          latitude?: number
          longitude?: number
          status?: Database["public"]["Enums"]["bin_status"]
          type?: Database["public"]["Enums"]["bin_type"]
          updated_at?: string
          ward?: string
          zone?: string
        }
        Relationships: []
      }
      collection_routes: {
        Row: {
          assigned_bins: string[] | null
          created_at: string
          id: string
          route_code: string
          route_name: string
          route_status: string
          scheduled_date: string
          truck_id: string | null
        }
        Insert: {
          assigned_bins?: string[] | null
          created_at?: string
          id?: string
          route_code: string
          route_name: string
          route_status?: string
          scheduled_date?: string
          truck_id?: string | null
        }
        Update: {
          assigned_bins?: string[] | null
          created_at?: string
          id?: string
          route_code?: string
          route_name?: string
          route_status?: string
          scheduled_date?: string
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_routes_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          assigned_wards: string[]
          completed_on_time: number
          compliance_score: number
          contact_person: string
          contractor_code: string
          created_at: string
          delayed: number
          email: string
          id: string
          name: string
          no_show: number
          phone: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          total_tasks: number
          updated_at: string
        }
        Insert: {
          assigned_wards?: string[]
          completed_on_time?: number
          compliance_score?: number
          contact_person: string
          contractor_code: string
          created_at?: string
          delayed?: number
          email: string
          id?: string
          name: string
          no_show?: number
          phone: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          total_tasks?: number
          updated_at?: string
        }
        Update: {
          assigned_wards?: string[]
          completed_on_time?: number
          compliance_score?: number
          contact_person?: string
          contractor_code?: string
          created_at?: string
          delayed?: number
          email?: string
          id?: string
          name?: string
          no_show?: number
          phone?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          total_tasks?: number
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          address: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          reporter_email: string | null
          reporter_name: string
          reporter_phone: string | null
          resolution_notes: string | null
          severity: Database["public"]["Enums"]["report_severity"]
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
          ward: string | null
          waste_type: Database["public"]["Enums"]["waste_type"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          reporter_email?: string | null
          reporter_name: string
          reporter_phone?: string | null
          resolution_notes?: string | null
          severity?: Database["public"]["Enums"]["report_severity"]
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          ward?: string | null
          waste_type?: Database["public"]["Enums"]["waste_type"] | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          reporter_email?: string | null
          reporter_name?: string
          reporter_phone?: string | null
          resolution_notes?: string | null
          severity?: Database["public"]["Enums"]["report_severity"]
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          ward?: string | null
          waste_type?: Database["public"]["Enums"]["waste_type"] | null
        }
        Relationships: []
      }
      trucks: {
        Row: {
          assigned_ward: string | null
          capacity_kg: number
          contractor_id: string | null
          created_at: string
          current_load_kg: number
          driver_name: string
          id: string
          last_update: string
          latitude: number
          longitude: number
          speed: number
          status: Database["public"]["Enums"]["truck_status"]
          truck_code: string
          vehicle_number: string
        }
        Insert: {
          assigned_ward?: string | null
          capacity_kg?: number
          contractor_id?: string | null
          created_at?: string
          current_load_kg?: number
          driver_name: string
          id?: string
          last_update?: string
          latitude?: number
          longitude?: number
          speed?: number
          status?: Database["public"]["Enums"]["truck_status"]
          truck_code: string
          vehicle_number: string
        }
        Update: {
          assigned_ward?: string | null
          capacity_kg?: number
          contractor_id?: string | null
          created_at?: string
          current_load_kg?: number
          driver_name?: string
          id?: string
          last_update?: string
          latitude?: number
          longitude?: number
          speed?: number
          status?: Database["public"]["Enums"]["truck_status"]
          truck_code?: string
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "trucks_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_pickup_tasks: {
        Row: {
          completed_time: string | null
          contractor_id: string | null
          created_at: string
          id: string
          locality: string
          quantity_kg: number
          remarks: string | null
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["task_status"]
          task_code: string
          truck_id: string | null
          updated_at: string
          ward: string
          waste_type: Database["public"]["Enums"]["waste_type"]
          zone: string
        }
        Insert: {
          completed_time?: string | null
          contractor_id?: string | null
          created_at?: string
          id?: string
          locality: string
          quantity_kg?: number
          remarks?: string | null
          scheduled_date?: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["task_status"]
          task_code: string
          truck_id?: string | null
          updated_at?: string
          ward: string
          waste_type?: Database["public"]["Enums"]["waste_type"]
          zone: string
        }
        Update: {
          completed_time?: string | null
          contractor_id?: string | null
          created_at?: string
          id?: string
          locality?: string
          quantity_kg?: number
          remarks?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_code?: string
          truck_id?: string | null
          updated_at?: string
          ward?: string
          waste_type?: Database["public"]["Enums"]["waste_type"]
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_pickup_tasks_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_pickup_tasks_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
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
      bin_status: "Active" | "Full" | "Maintenance"
      bin_type: "General" | "Recyclable" | "Organic" | "Hazardous"
      report_severity: "Low" | "Medium" | "High" | "Critical"
      report_status: "Pending" | "In Progress" | "Resolved"
      risk_level: "Low" | "Medium" | "High"
      task_status: "Completed" | "Pending" | "Delayed" | "No-Show"
      truck_status: "En Route" | "Loading" | "Returning" | "Idle"
      waste_type: "Dry" | "Wet" | "Mixed" | "Hazardous"
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
      bin_status: ["Active", "Full", "Maintenance"],
      bin_type: ["General", "Recyclable", "Organic", "Hazardous"],
      report_severity: ["Low", "Medium", "High", "Critical"],
      report_status: ["Pending", "In Progress", "Resolved"],
      risk_level: ["Low", "Medium", "High"],
      task_status: ["Completed", "Pending", "Delayed", "No-Show"],
      truck_status: ["En Route", "Loading", "Returning", "Idle"],
      waste_type: ["Dry", "Wet", "Mixed", "Hazardous"],
    },
  },
} as const
