import Link from "next/link";
export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice" role="status">
      {children}
    </div>
  );
}
export function Empty({
  title = "Tu próximo movimiento empieza aquí",
  text = "Cuando hagas una operación, podrás seguirla en este espacio.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <span aria-hidden="true">↗</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function SessionNotice() {
  return (
    <Notice>
      Conecta tu cuenta para consultar tu wallet y operar.{" "}
      <Link href="/login">Iniciar sesión ↗</Link>
    </Notice>
  );
}
export function amount(value: string | null | undefined) {
  return value == null
    ? "—"
    : new Intl.NumberFormat("es-BO", { maximumFractionDigits: 7 }).format(
        Number(value),
      );
}
