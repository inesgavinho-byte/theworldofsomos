import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MailboxClient from "./MailboxClient";

export default async function MailboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  return <MailboxClient profile={profile} />;
}
