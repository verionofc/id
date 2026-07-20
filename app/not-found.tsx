"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <section className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-foreground/50">
          404
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Página não encontrada
        </h1>

        <code className="mt-3 inline-block rounded-md border border-foreground/10 bg-background/60 px-3 py-1 text-xs text-foreground/60">
          {pathname}
        </code>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-foreground/15 px-4 py-2 text-sm text-foreground/70 transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            Voltar
          </Link>

          <Link
            href="/?auth=sign-in"
            className="rounded-lg border border-foreground/15 px-4 py-2 text-sm text-foreground/70 transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            Logar
          </Link>
        </div>
      </div>
    </section>
  );
}
