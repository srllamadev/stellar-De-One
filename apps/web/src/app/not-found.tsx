import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel">
      <p className="eyebrow">404</p>
      <h1>Este camino no existe.</h1>
      <Link className="button primary" href="/dashboard">
        Volver al inicio ↗
      </Link>
    </section>
  );
}
