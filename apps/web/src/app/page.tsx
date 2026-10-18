"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProduct } from "@/providers/product-provider";
export default function Home() {
  const { session } = useProduct();
  const router = useRouter();
  useEffect(() => {
    if (session?.isAuthenticated && !session.verified) return;
    const timer = setTimeout(
      () => router.replace(session?.verified ? "/dashboard" : "/login"),
      1500,
    );
    return () => clearTimeout(timer);
  }, [session?.isAuthenticated, session?.verified, router]);
  return (
    <p className="loading" role="status">
      Preparando tu espacio De-One…
    </p>
  );
}
