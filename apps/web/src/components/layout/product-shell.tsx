"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useProduct } from "@/providers/product-provider";

const links = [
  ["/dashboard", "◫", "Inicio"],
  ["/send", "↗", "Enviar"],
  ["/receive", "↙", "Recibir"],
  ["/history", "≋", "Movimientos"],
  ["/profile", "◉", "Mi perfil"],
];
export function Brand() {
  return (
    <Link href="/dashboard" className="brand" aria-label="De-One, inicio">
      <span className="brand-symbol">
        d<span>•</span>
      </span>
      De-One<span className="brand-dot">.</span>
    </Link>
  );
}
export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session } = useProduct();
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (
      sessionStorage.getItem("deone-intro") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const frame = requestAnimationFrame(() => setIntro(false));
      return () => cancelAnimationFrame(frame);
    }
    sessionStorage.setItem("deone-intro", "seen");
    const timer = setTimeout(() => setIntro(false), 1400);
    return () => clearTimeout(timer);
  }, []);
  const authPage = pathname === "/login" || pathname === "/register";
  return (
    <>
      {intro && (
        <div className="intro" aria-hidden="true">
          <div>
            De-One<span>.</span>
          </div>
          <i />
        </div>
      )}
      {authPage ? (
        <main className="auth-layout">{children}</main>
      ) : (
        <div className="app-layout">
          <aside className="sidebar">
            <Brand />
            <div className="workspace-label">TU DINERO, MÁS CERCA</div>
            <nav aria-label="Navegación principal">
              {links.map(([href, icon, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? "active" : ""}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  <span aria-hidden="true">{icon}</span>
                  {label}
                  {href === "/send" && <b>↗</b>}
                </Link>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="corridor-mini">
                <span>BR</span>
                <i>→</i>
                <span>BO</span>
              </div>
              <p>
                Dos países.
                <br />
                <strong>Un mismo camino.</strong>
              </p>
              <small>Brasil → Bolivia</small>
            </div>
            <Link
              href={session?.verified ? "/profile" : "/login"}
              className="account-chip"
            >
              <span className="avatar">{session?.verified ? "D" : "→"}</span>
              <span>
                {session?.verified ? "Tu cuenta" : "Conecta tu cuenta"}
                <small>
                  {session?.verified ? "Ver perfil" : "Iniciar sesión"}
                </small>
              </span>
            </Link>
          </aside>
          <div className="main-column">
            <header className="topbar">
              <span>
                PERSONAS <i>/</i>{" "}
                {links.find(([href]) => href === pathname)?.[2] ?? "De-One"}
              </span>
              <div>
                <span className="network-tag">
                  <i />
                  Testnet
                </span>
                <Link className="avatar" href="/profile" aria-label="Mi perfil">
                  D
                </Link>
              </div>
            </header>
            <main className="content">{children}</main>
            <footer className="app-footer">
              <span>De-One © 2026</span>
              <span>Pagas en tu moneda. Le llega en la suya.</span>
              <Link href="/profile">Tu cuenta y conexión ↗</Link>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
