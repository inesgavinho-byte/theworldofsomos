import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the requesting parent
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const { criancaId, pin } = await req.json();

    // Validate PIN format
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ erro: "PIN inválido. Deve ter 4 dígitos." }, { status: 400 });
    }

    // Verify the child belongs to the parent's family
    const { data: familyMember } = await supabase
      .from("familia_membros")
      .select("familia_id")
      .eq("profile_id", user.id)
      .single();

    if (!familyMember?.familia_id) {
      return NextResponse.json({ erro: "Família não encontrada" }, { status: 403 });
    }

    const { data: crianca } = await supabase
      .from("criancas")
      .select("id, user_id, nome")
      .eq("id", criancaId)
      .eq("familia_id", familyMember.familia_id)
      .single();

    if (!crianca) {
      return NextResponse.json({ erro: "Criança não encontrada" }, { status: 404 });
    }

    const admin = createAdminClient();
    const pinEmail = `pin_${pin}@somos.app`;
    const pinHash = await bcrypt.hash(pin, 10);

    if (crianca.user_id) {
      // Update existing auth user: change email + password to match new PIN
      await admin.auth.admin.updateUserById(crianca.user_id, {
        email: pinEmail,
        password: pin,
      });
    } else {
      // Create new auth user for this child
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: pinEmail,
        password: pin,
        email_confirm: true,
        user_metadata: { nome: crianca.nome, tipo: "crianca" },
      });

      if (createError) {
        // If email already taken, fetch existing user and reuse
        if (createError.message?.includes("already been registered")) {
          const { data: existingUser } = await admin.auth.admin.listUsers();
          const found = existingUser?.users?.find((u) => u.email === pinEmail);
          if (found) {
            await admin.auth.admin.updateUserById(found.id, { password: pin });
            // Create profile if missing
            await admin.from("profiles").upsert({
              id: found.id,
              nome: crianca.nome,
              tipo: "crianca",
            });
            await admin
              .from("criancas")
              .update({ user_id: found.id, pin: pinHash })
              .eq("id", criancaId);
            await log({
              userId: user.id,
              action: 'child.pin_set',
              entityType: 'crianca',
              entityId: criancaId,
              request: req,
            });
            return NextResponse.json({ ok: true });
          }
        }
        return NextResponse.json({ erro: createError.message }, { status: 500 });
      }

      if (!newUser?.user) {
        return NextResponse.json({ erro: "Erro ao criar utilizador" }, { status: 500 });
      }

      // Create profile for the new child auth user
      await admin.from("profiles").upsert({
        id: newUser.user.id,
        nome: crianca.nome,
        tipo: "crianca",
      });

      // Link auth user to criança
      await admin
        .from("criancas")
        .update({ user_id: newUser.user.id, pin: pinHash })
        .eq("id", criancaId);

      await log({
        userId: user.id,
        action: 'child.pin_set',
        entityType: 'crianca',
        entityId: criancaId,
        request: req,
      });
      return NextResponse.json({ ok: true });
    }

    // Update PIN hash on existing user
    await admin
      .from("criancas")
      .update({ pin: pinHash })
      .eq("id", criancaId);

    await log({
      userId: user.id,
      action: 'child.pin_set',
      entityType: 'crianca',
      entityId: criancaId,
      request: req,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[definir-pin]", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
