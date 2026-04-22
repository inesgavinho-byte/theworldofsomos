export function primeiroNome(nomeCompleto: string | null | undefined): string {
  if (!nomeCompleto) return "";
  return nomeCompleto.trim().split(/\s+/)[0];
}
