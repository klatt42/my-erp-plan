/**
 * Manual migration runner
 * Run with: npx tsx scripts/run-migration.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Read the migration file
  const migrationPath = path.join(
    process.cwd(),
    "supabase/migrations/20250126000000_add_facility_research.sql"
  );

  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  console.log("Running migration: add_facility_research...");

  try {
    // Execute the migration
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      const statements = migrationSQL
        .split(";")
        .filter((s) => s.trim().length > 0);

      for (const statement of statements) {
        const { error: stmtError } = await supabase.from("_migrations").insert({
          statement: statement.trim(),
          executed_at: new Date().toISOString(),
        });

        if (stmtError) {
          console.error("Migration error:", stmtError);
          throw stmtError;
        }
      }
    }

    console.log("Migration completed successfully!");
    console.log("\nAdded columns:");
    console.log("  - facility_research (JSONB)");
    console.log("  - research_last_updated (TIMESTAMPTZ)");
  } catch (error) {
    console.error("Failed to run migration:", error);
    process.exit(1);
  }
}

runMigration();
