/** Generated-style Supabase typings for SiteBrief tables. */

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          website: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          website?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          website?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      website_intakes: {
        Row: {
          id: string;
          client_id: string;
          business_summary: string | null;
          services: string | null;
          ideal_customer: string | null;
          problem_solved: string | null;
          unique_value: string | null;
          website_goal: string | null;
          desired_actions: string | null;
          success_metrics: string | null;
          pages_needed: string | null;
          content_status: string | null;
          features_needed: string | null;
          branding_status: string | null;
          brand_personality: string | null;
          liked_websites: string | null;
          disliked_websites: string | null;
          domain_status: string | null;
          hosting_status: string | null;
          platform_preference: string | null;
          integrations_needed: string | null;
          tone_of_voice: string | null;
          key_messages: string | null;
          offers: string | null;
          testimonials: string | null;
          compliance_needs: string | null;
          future_expansion: string | null;
          ai_features: string | null;
          budget_range: string | null;
          deadline: string | null;
          priority_level: string | null;
          extra_notes: string | null;
          generated_prompt_pack: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          business_summary?: string | null;
          services?: string | null;
          ideal_customer?: string | null;
          problem_solved?: string | null;
          unique_value?: string | null;
          website_goal?: string | null;
          desired_actions?: string | null;
          success_metrics?: string | null;
          pages_needed?: string | null;
          content_status?: string | null;
          features_needed?: string | null;
          branding_status?: string | null;
          brand_personality?: string | null;
          liked_websites?: string | null;
          disliked_websites?: string | null;
          domain_status?: string | null;
          hosting_status?: string | null;
          platform_preference?: string | null;
          integrations_needed?: string | null;
          tone_of_voice?: string | null;
          key_messages?: string | null;
          offers?: string | null;
          testimonials?: string | null;
          compliance_needs?: string | null;
          future_expansion?: string | null;
          ai_features?: string | null;
          budget_range?: string | null;
          deadline?: string | null;
          priority_level?: string | null;
          extra_notes?: string | null;
          generated_prompt_pack?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          business_summary?: string | null;
          services?: string | null;
          ideal_customer?: string | null;
          problem_solved?: string | null;
          unique_value?: string | null;
          website_goal?: string | null;
          desired_actions?: string | null;
          success_metrics?: string | null;
          pages_needed?: string | null;
          content_status?: string | null;
          features_needed?: string | null;
          branding_status?: string | null;
          brand_personality?: string | null;
          liked_websites?: string | null;
          disliked_websites?: string | null;
          domain_status?: string | null;
          hosting_status?: string | null;
          platform_preference?: string | null;
          integrations_needed?: string | null;
          tone_of_voice?: string | null;
          key_messages?: string | null;
          offers?: string | null;
          testimonials?: string | null;
          compliance_needs?: string | null;
          future_expansion?: string | null;
          ai_features?: string | null;
          budget_range?: string | null;
          deadline?: string | null;
          priority_level?: string | null;
          extra_notes?: string | null;
          generated_prompt_pack?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "website_intakes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_notes: {
        Row: {
          id: string;
          intake_id: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          intake_id: string;
          note: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          intake_id?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_notes_intake_id_fkey";
            columns: ["intake_id"];
            isOneToOne: false;
            referencedRelation: "website_intakes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      sitebrief_is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
};

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type WebsiteIntakeRow = Database["public"]["Tables"]["website_intakes"]["Row"];
export type WebsiteIntakeInsert = Database["public"]["Tables"]["website_intakes"]["Insert"];
export type WebsiteIntakeAdminUpdate =
  Pick<
    Database["public"]["Tables"]["website_intakes"]["Update"],
    "status" | "generated_prompt_pack"
  >;
export type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];
export type AdminNoteInsert = Database["public"]["Tables"]["admin_notes"]["Insert"];

export type WebsiteIntakeWithClientRow = WebsiteIntakeRow & {
  clients: ClientRow | null;
};

/** Fields the public intake flow may populate (everything except admin-managed defaults). */
export type PublicWebsiteIntakeFields = Omit<
  WebsiteIntakeInsert,
  "id" | "client_id" | "generated_prompt_pack" | "status" | "created_at" | "updated_at"
>;

export type SubmitWebsiteIntakePayload = {
  client: ClientInsert;
  intake: PublicWebsiteIntakeFields;
};
