import { createAdminClient } from '@/lib/supabase/admin';

export type AuditAction =
  // Auth
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.context_switch'
  | 'auth.password_reset'
  // Família
  | 'familia.create'
  | 'familia.member_add'
  | 'familia.member_remove'
  // Criança
  | 'child.create'
  | 'child.update'
  | 'child.pin_set'
  | 'child.pin_login_success'
  | 'child.pin_login_failed'
  | 'child.pin_lockout'
  | 'child.pin_rate_limited'
  | 'child.data_reset'
  // Sessões e progresso
  | 'session.complete'
  | 'session.momento_generated'
  | 'session.jarro_unlock'
  // Fluxo de lição (Fase 0.3 — rastreio do percurso da criança)
  | 'licao.iniciada'
  | 'licao.exercicio_respondido'
  | 'licao.reflexao_completa'
  | 'licao.momento_entregue'
  | 'licao.concluida'
  | 'estrelas.ganhas'
  | 'jarro.desbloqueado'
  // IA
  | 'ai.book_upload'
  | 'ai.exercises_generated'
  | 'ai.mailbox_auto_response'
  // Admin
  | 'admin.user_view'
  | 'admin.guilda_approve'
  | 'admin.guilda_reject'
  | 'admin.content_edit'
  // Lições (conteúdo)
  | 'licao.publicada'
  | 'licao.despublicada'
  | 'licao.editada'
  // Exercícios (conteúdo)
  | 'exercicio.criado'
  | 'exercicio.editado'
  | 'exercicio.apagado'
  | 'exercicio.reordenado'
  // Guilda
  | 'guilda.apply'
  | 'guilda.approved'
  | 'guilda.rejected'
  // Mail Box
  | 'mailbox.letter_sent'
  | 'mailbox.letter_responded'
  | 'mailbox.letter_auto_responded'
  | 'mailbox.letter_expired'
  // Diário de desenvolvimento
  | 'diario.criada'
  | 'diario.editada'
  | 'diario.apagada'
  // Diagnóstico curricular
  | 'diagnostico.iniciado'
  | 'diagnostico.exercicio_respondido'
  | 'diagnostico.concluido'
  | 'diagnostico.abandonado';

interface AuditEntry {
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  request?: Request;
}

export async function log(entry: AuditEntry): Promise<void> {
  try {
    const supabaseAdmin = createAdminClient();

    const ipAddress = entry.request?.headers.get('x-forwarded-for')
      ?? entry.request?.headers.get('x-real-ip')
      ?? null;

    const userAgent = entry.request?.headers.get('user-agent') ?? null;

    await supabaseAdmin.from('audit_logs').insert({
      user_id: entry.userId ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (err) {
    // Nunca deixar falha de audit crashar o request principal
    console.error('[audit] Falha ao registar acção:', entry.action, err);
  }
}
