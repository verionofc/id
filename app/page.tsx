import { cookies } from "next/headers";

import { AuthProviderPage } from "@/components/auth/page";
import { Footer } from "@/components/ui/Footer";
import { LeftCard, RightCard } from "@/components/ui/Card";
import { settings } from "@/settings";

export default async function Page({ searchParams }: DefaultAuthProps) {
  const cookieStore = await cookies();

  const response = await fetch(
    `${settings.default.api_url}/auth/get-session`,
    {
      headers: {
        cookie: cookieStore
          .toString(),
      },
      cache: "no-store",
    }
  );

  const session = await response.json();
  const params = await searchParams;

  const authType: DefaultAuthType =
    params.auth === "sign-in" ||
    params.auth === "sign-up" ||
    params.auth === "ok"
      ? params.auth
      : "sign-in";


  return (
    <section className="flex min-h-screen w-full flex-col lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch justify-center gap-2 px-3 pt-1 pb-6 sm:gap-4 sm:px-6 sm:pt-6 sm:pb-4 lg:items-center lg:gap-6 lg:pb-6">
        <LeftCard
          paired
          visible="hidden"
          className="w-full lg:flex-1"
        >
          <AuthProviderPage
            auth={authType}
            callback={
              params.callback || settings.default.id_url + "/?auth=ok"
            }
          />
        </LeftCard>

        <RightCard
          paired
          type="carousel-full"
          visible="all"
          className={session ? "hidden" : "hidden lg:block lg:flex-1"}
          images={[
            "https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
          ]}
          captions={[
            "Gerencie suas identidades com segurança e simplicidade.",
            "Autenticação unificada para todos os seus serviços.",
          ]}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 pb-3 sm:px-6">
        <Footer />
      </div>
    </section>
  );
}