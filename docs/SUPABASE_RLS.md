# Supabase Row Level Security (SiteBrief)

Source of truth for policies is **`supabase/migrations/20260505120000_sitebrief_schema.sql`** (plus follow-up migrations). This document summarizes how each table behaves for **`anon`**, **`authenticated`** (JWT from Supabase Auth), and the **`sitebrief_is_admin()`** helper.

## Helper

- **`sitebrief_is_admin()`** reads `role` from JWT `app_metadata` first, then `user_metadata`, and returns true only when the value is exactly `"admin"`.
- **Provision admins** (run in SQL as a privileged role):

  ```sql
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role','admin')
  WHERE id = '<user-uuid>';
  ```

## `clients`

| Operation | Roles | Effect |
|-----------|-------|--------|
| **INSERT** | `anon`, `authenticated` | **Allowed** (`WITH CHECK (true)`): public intake may create a row. Only non-null columns enforced by Postgres NOT NULL constraints. |
| **SELECT / UPDATE / DELETE** | `authenticated` | Allowed only when **`sitebrief_is_admin()`** is true. **`anon`** has **no** read/update/delete policies. |

## `website_intakes`

| Operation | Roles | Effect |
|-----------|-------|--------|
| **INSERT** | `anon`, `authenticated` | **Allowed**: public intake inserts a row (typically referencing a client just inserted in the same flow). Status defaults apply per migration (`New`). |
| **SELECT / UPDATE / DELETE** | `authenticated` | Allowed only when **`sitebrief_is_admin()`** is true. |

Anonymous clients therefore **cannot** list or scrape intakes unless they authenticate as an admin-capable JWT.

## `admin_notes`

| Operation | Roles | Effect |
|-----------|-------|--------|
| All | `authenticated` | **Only** when **`sitebrief_is_admin()`** is true. No public access. |

## Grants

The migration grants DML rights on these tables to **`anon`** and **`authenticated`** at the privilege level; **RLS still filters** which rows each role can see or change. Do not disable RLS in production without replacing it with another enforcement layer.

## Operational checks

- If public intake fails with **RLS or permission** errors, confirm insert policies exist and the request uses the **anon key** (or an authenticated user that is still allowed to insert per policy).
- If the **admin UI** returns empty lists despite data in the table, the JWT is almost certainly missing **`role: "admin"`** in metadata, so select policies evaluate to false.
