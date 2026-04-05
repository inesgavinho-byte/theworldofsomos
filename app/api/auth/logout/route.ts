import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });

  // Fix 10: apagar cookie somos-context no logout
  response.cookies.delete("somos-context");

  return response;
}
