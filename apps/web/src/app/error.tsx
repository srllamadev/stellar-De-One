"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel">
      <h1>No pudimos abrir este espacio.</h1>
      <p>Intenta nuevamente para recuperar tu conexión.</p>
      <button className="button primary" onClick={reset}>
        Reintentar
      </button>
    </section>
  );
}
