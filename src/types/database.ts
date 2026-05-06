/** Generated-style Supabase typings for SiteBrief tables. */

import type { StoredInternalPriceEstimate } from "@/types/price-estimate";

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
          internal_price_estimate: StoredInternalPriceEstimate | null;
          extra_revision_rounds_purchased: number;
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
          internal_price_estimate?: StoredInternalPriceEstimate | null;
          extra_revision_rounds_purchased?: number;
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
          internal_price_estimate?: StoredInternalPriceEstimate | null;
          extra_revision_rounds_purchased?: number;
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
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      revision_rounds: {
        Row: {
          id: string;
          intake_id: string;
          round_number: number;
          status: string;
          review_notes: string | null;
          overall_impression: string | null;
          final_comments: string | null;
          customer_access_token: string;
          token_revoked_at: string | null;
          created_at: string;
          submitted_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          intake_id: string;
          round_number: number;
          status?: string;
          review_notes?: string | null;
          overall_impression?: string | null;
          final_comments?: string | null;
          customer_access_token?: string;
          token_revoked_at?: string | null;
          created_at?: string;
          submitted_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          intake_id?: string;
          round_number?: number;
          status?: string;
          review_notes?: string | null;
          overall_impression?: string | null;
          final_comments?: string | null;
          customer_access_token?: string;
          token_revoked_at?: string | null;
          created_at?: string;
          submitted_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "revision_rounds_intake_id_fkey";
            columns: ["intake_id"];
            isOneToOne: false;
            referencedRelation: "website_intakes";
            referencedColumns: ["id"];
          },
        ];
      };
      revision_items: {
        Row: {
          id: string;
          round_id: string;
          category: string;
          page_reference: string | null;
          description: string;
          priority: string;
          admin_response: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          round_id: string;
          category: string;
          page_reference?: string | null;
          description: string;
          priority: string;
          admin_response?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          round_id?: string;
          category?: string;
          page_reference?: string | null;
          description?: string;
          priority?: string;
          admin_response?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "revision_items_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "revision_rounds";
            referencedColumns: ["id"];
          },
        ];
      };
      revision_prompts: {
        Row: {
          id: string;
          round_id: string;
          prompt_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          round_id: string;
          prompt_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          round_id?: string;
          prompt_text?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "revision_prompts_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "revision_rounds";
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
      white_label_requests: {
        Row: {
          id: string;
          submission_type: string;
          contact_name: string;
          email: string;
          organization: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_type?: string;
          contact_name: string;
          email: string;
          organization?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_type?: string;
          contact_name?: string;
          email?: string;
          organization?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      studio_subscription: {
        Row: {
          id: number;
          subscription_tier: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          subscription_tier?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          subscription_tier?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      sitebrief_submission_rate_events: {
        Row: {
          id: string;
          ip_hash: string;
          kind: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_hash: string;
          kind: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_hash?: string;
          kind?: string;
          created_at?: string;
        };
        Relationships: [];
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
    "status" | "generated_prompt_pack" | "internal_price_estimate" | "extra_revision_rounds_purchased"
  >;
export type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];
export type AdminNoteInsert = Database["public"]["Tables"]["admin_notes"]["Insert"];
export type WhiteLabelRequestRow = Database["public"]["Tables"]["white_label_requests"]["Row"];
export type WhiteLabelRequestInsert = Database["public"]["Tables"]["white_label_requests"]["Insert"];
export type StudioSubscriptionRow = Database["public"]["Tables"]["studio_subscription"]["Row"];
export type StudioSubscriptionUpdate = Database["public"]["Tables"]["studio_subscription"]["Update"];

export type WebsiteIntakeWithClientRow = WebsiteIntakeRow & {
  clients: ClientRow | null;
};

export type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
export type ContactMessageInsert = Database["public"]["Tables"]["contact_messages"]["Insert"];
export type RevisionRoundRow = Database["public"]["Tables"]["revision_rounds"]["Row"];
export type RevisionRoundInsert = Database["public"]["Tables"]["revision_rounds"]["Insert"];
export type RevisionItemRow = Database["public"]["Tables"]["revision_items"]["Row"];
export type RevisionItemInsert = Database["public"]["Tables"]["revision_items"]["Insert"];
export type RevisionPromptRow = Database["public"]["Tables"]["revision_prompts"]["Row"];
export type RevisionPromptInsert = Database["public"]["Tables"]["revision_prompts"]["Insert"];

/** Fields the public intake flow may populate (everything except admin-managed defaults). */
export type PublicWebsiteIntakeFields = Omit<
  WebsiteIntakeInsert,
  | "id"
  | "client_id"
  | "generated_prompt_pack"
  | "internal_price_estimate"
  | "extra_revision_rounds_purchased"
  | "status"
  | "created_at"
  | "updated_at"
>;

export type SubmitWebsiteIntakePayload = {
  client: ClientInsert;
  intake: PublicWebsiteIntakeFields;
};
