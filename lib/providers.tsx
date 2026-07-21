"use client";

import { ThemeProvider } from "next-themes";
import { ViewTransition } from "react";
import { AuthLoadingProvider } from "@/components/auth/loading";

function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthLoadingProvider>
        <ViewTransition>
          <div className="relative z-10 flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            {/*<Footer />*/}
          </div>
        </ViewTransition>
      </AuthLoadingProvider>
    </ThemeProvider>
  );
}

// export function WebsiteProviders({ children }: ProvidersProps) {
//   return (
//     <Providers>
//       <Header />

//       <main className="pt-17.5">{children}</main>

//       {/* <Cookies /> */}
//     </Providers>
//   );
// }

export { Providers as DefaultProviders };
