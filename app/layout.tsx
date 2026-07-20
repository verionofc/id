import type { Metadata } from "next";

import "@/styles/globals.css";
import { DefaultProviders } from "@/lib/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://id-verionstudio.vercel.app/"),
  title: {
    default: "Verion ID",
    template: `Verion ID — %s`,
  },
  authors: [{ name: "Verion Studio", url: "https://github.com/verionofc" }],
  creator: "Israel R. Jatobá",
  icons: {
    icon: "/verion/svg/favicon.svg",
    
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="antialiased relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Background Grid Adaptativo */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            opacity: 0.1, // Ajuste a opacidade para o grid não ficar muito forte
            maskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
            `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />{" "}
        <DefaultProviders>{children}</DefaultProviders>
      </body>
    </html>
  );
}
