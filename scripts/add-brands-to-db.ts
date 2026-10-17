/**
 * Adds brands to the live Supabase `brands` table WITHOUT clearing anything.
 * Skips slugs that already exist.
 *
 * Run with: npx tsx scripts/add-brands-to-db.ts <slug> [<slug>…]
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

import { brands } from "../src/lib/catalogue/brands";

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

async function main() {
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) throw new Error("Pass at least one brand slug.");
  const env = loadEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  for (const slug of slugs) {
    const b = brands.find((x) => x.slug === slug);
    if (!b) throw new Error(`No static brand with slug ${slug}`);
    const { data: existing } = await supabase.from("brands").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      console.log(`${slug}: already in the database, skipped`);
      continue;
    }
    const { error } = await supabase.from("brands").insert({ name: b.name, slug: b.slug });
    if (error) throw new Error(`${slug}: ${error.message}`);
    console.log(`${slug}: added`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
