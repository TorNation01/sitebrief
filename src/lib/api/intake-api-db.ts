import { NextResponse } from "next/server";

import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export function intakeApiServiceRoleMissingResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "service_unavailable",
        message:
          "Intake API requires SUPABASE_SERVICE_ROLE_KEY on the server (RLS-safe reads/writes for privileged routes).",
      },
    },
    { status: 503 },
  );
}

export function getIntakeApiSupabase() {
  return tryCreateSupabaseServiceRoleClient();
}
