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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_provider_connections: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_default: boolean
          label: string
          last_test_status: string | null
          last_tested_at: string | null
          model_preferences: Json
          provider: string
          secret_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_default?: boolean
          label: string
          last_test_status?: string | null
          last_tested_at?: string | null
          model_preferences?: Json
          provider: string
          secret_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_default?: boolean
          label?: string
          last_test_status?: string | null
          last_tested_at?: string | null
          model_preferences?: Json
          provider?: string
          secret_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_turns: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_tokens: number | null
          mode: string
          model: string | null
          output_tokens: number | null
          plan_payload: Json | null
          project_id: string
          prompt: string
          provider: string | null
          result_payload: Json | null
          started_at: string | null
          status: string
          summary: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          mode: string
          model?: string | null
          output_tokens?: number | null
          plan_payload?: Json | null
          project_id: string
          prompt: string
          provider?: string | null
          result_payload?: Json | null
          started_at?: string | null
          status?: string
          summary?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          mode?: string
          model?: string | null
          output_tokens?: number | null
          plan_payload?: Json | null
          project_id?: string
          prompt?: string
          provider?: string | null
          result_payload?: Json | null
          started_at?: string | null
          status?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_turns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      github_integrations: {
        Row: {
          account_label: string
          auto_push_enabled: boolean
          created_at: string
          created_by: string
          default_branch: string
          id: string
          installation_id: string | null
          last_sync_status: string | null
          last_synced_at: string | null
          project_id: string
          repository_name: string
          repository_owner: string
          token_secret_id: string | null
          updated_at: string
        }
        Insert: {
          account_label: string
          auto_push_enabled?: boolean
          created_at?: string
          created_by: string
          default_branch?: string
          id?: string
          installation_id?: string | null
          last_sync_status?: string | null
          last_synced_at?: string | null
          project_id: string
          repository_name: string
          repository_owner: string
          token_secret_id?: string | null
          updated_at?: string
        }
        Update: {
          account_label?: string
          auto_push_enabled?: boolean
          created_at?: string
          created_by?: string
          default_branch?: string
          id?: string
          installation_id?: string | null
          last_sync_status?: string | null
          last_synced_at?: string | null
          project_id?: string
          repository_name?: string
          repository_owner?: string
          token_secret_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          mime_type: string
          project_id: string
          sha256: string | null
          size_bytes: number
          source: string
          storage_path: string | null
          text_content: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          mime_type: string
          project_id: string
          sha256?: string | null
          size_bytes: number
          source?: string
          storage_path?: string | null
          text_content?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string
          project_id?: string
          sha256?: string | null
          size_bytes?: number
          source?: string
          storage_path?: string | null
          text_content?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_knowledge: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          project_id: string
          source_file_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          project_id: string
          source_file_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          project_id?: string
          source_file_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_knowledge_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_knowledge_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
        ]
      }
      project_secrets: {
        Row: {
          created_at: string
          created_by: string
          id: string
          project_id: string
          secret_key: string
          updated_at: string
          vault_secret_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          secret_key: string
          updated_at?: string
          vault_secret_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          secret_key?: string
          updated_at?: string
          vault_secret_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_secrets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_share_links: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          label: string
          project_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string
          project_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string
          project_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_share_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_shares: {
        Row: {
          created_at: string
          invited_by: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          invited_by: string
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          invited_by?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_snapshots: {
        Row: {
          branch_name: string
          commit_sha: string | null
          created_at: string
          created_by: string | null
          files_manifest: Json
          id: string
          label: string
          project_id: string
          summary: string | null
          turn_id: string | null
        }
        Insert: {
          branch_name?: string
          commit_sha?: string | null
          created_at?: string
          created_by?: string | null
          files_manifest?: Json
          id?: string
          label: string
          project_id: string
          summary?: string | null
          turn_id?: string | null
        }
        Update: {
          branch_name?: string
          commit_sha?: string | null
          created_at?: string
          created_by?: string | null
          files_manifest?: Json
          id?: string
          label?: string
          project_id?: string
          summary?: string | null
          turn_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_snapshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_snapshots_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "chat_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          active_branch: string
          created_at: string
          created_by: string
          description: string
          github_branch: string
          github_repo: string | null
          id: string
          instructions: string
          is_published: boolean
          is_starred: boolean
          name: string
          published_url: string | null
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active_branch?: string
          created_at?: string
          created_by: string
          description?: string
          github_branch?: string
          github_repo?: string | null
          id?: string
          instructions?: string
          is_published?: boolean
          is_starred?: boolean
          name: string
          published_url?: string | null
          slug: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active_branch?: string
          created_at?: string
          created_by?: string
          description?: string
          github_branch?: string
          github_repo?: string | null
          id?: string
          instructions?: string
          is_published?: boolean
          is_starred?: boolean
          name?: string
          published_url?: string | null
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          command: string
          created_at: string
          created_by: string
          description: string
          id: string
          instructions: string
          is_enabled: boolean
          name: string
          updated_at: string
          version: number
          workspace_id: string
        }
        Insert: {
          command: string
          created_at?: string
          created_by: string
          description?: string
          id?: string
          instructions: string
          is_enabled?: boolean
          name: string
          updated_at?: string
          version?: number
          workspace_id: string
        }
        Update: {
          command?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          instructions?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      supabase_connectors: {
        Row: {
          anon_key: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          last_test_status: string | null
          last_tested_at: string | null
          organization_label: string
          project_id: string
          project_url: string
          schema_snapshot: Json
          service_role_secret_id: string | null
          updated_at: string
        }
        Insert: {
          anon_key: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          last_test_status?: string | null
          last_tested_at?: string | null
          organization_label: string
          project_id: string
          project_url: string
          schema_snapshot?: Json
          service_role_secret_id?: string | null
          updated_at?: string
        }
        Update: {
          anon_key?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          last_test_status?: string | null
          last_tested_at?: string | null
          organization_label?: string
          project_id?: string
          project_url?: string
          schema_snapshot?: Json
          service_role_secret_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supabase_connectors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      turn_events: {
        Row: {
          created_at: string
          detail: string | null
          diff_patch: string | null
          duration_ms: number | null
          id: string
          kind: string
          label: string
          payload: Json
          turn_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          diff_patch?: string | null
          duration_ms?: number | null
          id?: string
          kind: string
          label: string
          payload?: Json
          turn_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          diff_patch?: string | null
          duration_ms?: number | null
          id?: string
          kind?: string
          label?: string
          payload?: Json
          turn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turn_events_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "chat_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          default_mode: string
          preferred_chat_width: number
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          default_mode?: string
          preferred_chat_width?: number
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          default_mode?: string
          preferred_chat_width?: number
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_project: { Args: { target_project: string }; Returns: boolean }
      can_edit_project: { Args: { target_project: string }; Returns: boolean }
      can_manage_project_shares: {
        Args: { target_project: string }
        Returns: boolean
      }
      create_project_share_link: {
        Args: { p_label?: string; p_project_id: string }
        Returns: Json
      }
      ensure_my_workspace: { Args: never; Returns: string }
      is_workspace_member: {
        Args: { target_workspace: string }
        Returns: boolean
      }
      read_project_secret: {
        Args: { p_project_id: string; p_secret_key: string }
        Returns: string
      }
      seed_figurable_skills: {
        Args: { target_user: string; target_workspace: string }
        Returns: undefined
      }
      store_project_secret: {
        Args: {
          p_project_id: string
          p_secret_key: string
          p_secret_value: string
        }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
