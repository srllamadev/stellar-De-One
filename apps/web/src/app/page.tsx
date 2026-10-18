import { ConnectionStatus } from "@/components/connection-status";
import { getPollarState } from "@/lib/pollar/config";
import Link from "next/link";

export default function Home() {
  const pollar = getPollarState();
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-12 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">remesas<span className="text-teal-700">/</span>latam</Link>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">Entorno de desarrollo</span>
      </header>
      <section className="max-w-2xl py-16 sm:py-24">
        <p className="mb-5 text-xs font-bold tracking-[0.2em] text-teal-700">FASE 0 · BASE TÉCNICA</p>
        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-950 sm:text-6xl">Más cerca,<br />incluso a la distancia.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Estamos construyendo una forma sencilla de enviar remesas internacionales en Latinoamérica, con recepción en moneda local.</p>
        <p className="mt-4 text-sm leading-6 text-slate-500">Esta pantalla verifica la infraestructura inicial. Los envíos de dinero todavía no están habilitados.</p>
      </section>
      <section aria-label="Estado de los servicios" className="grid gap-5 md:grid-cols-2">
        <ConnectionStatus />
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Integración prevista</p>
          <h2 className="mt-4 text-xl font-semibold">Pollar + Stellar</h2>
          <p className="mt-3 text-sm text-slate-600">{pollar.message}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-md bg-slate-100 px-2.5 py-1.5">Solo Testnet</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1.5">Sin operaciones financieras</span>
          </div>
        </article>
      </section>
      <footer className="mt-auto flex flex-wrap justify-between gap-3 pt-12 text-xs leading-5 text-slate-500">
        <p>remesas-latam · Infraestructura para el Sprint 1</p>
        <p>Next.js / FastAPI / PostgreSQL</p>
      </footer>
    </main>
  );
}
