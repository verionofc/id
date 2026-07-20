"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fingerprint,
  Laptop,
  MapPin,
  ShieldAlert,
  Smartphone,
  Tablet,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { settings } from "@/settings";

/** Extrai um resumo legível (navegador + sistema) a partir do user-agent bruto. */
function parseUserAgent(userAgent?: string | null) {
  if (!userAgent) return { label: "Dispositivo desconhecido", kind: "desktop" as const };

  const ua = userAgent.toLowerCase();

  const os = ua.includes("windows")
    ? "Windows"
    : ua.includes("mac os")
      ? "macOS"
      : ua.includes("android")
        ? "Android"
        : ua.includes("iphone") || ua.includes("ipad")
          ? "iOS"
          : ua.includes("linux")
            ? "Linux"
            : "Sistema desconhecido";

  const browser = ua.includes("edg/")
    ? "Edge"
    : ua.includes("chrome")
      ? "Chrome"
      : ua.includes("firefox")
        ? "Firefox"
        : ua.includes("safari")
          ? "Safari"
          : "Navegador desconhecido";

  const kind = ua.includes("ipad") || ua.includes("tablet")
    ? ("tablet" as const)
    : ua.includes("mobi") || ua.includes("android")
      ? ("mobile" as const)
      : ("desktop" as const);

  return { label: `${browser} · ${os}`, kind };
}

const deviceIcon = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2">
      <span className="text-sm text-default-400">{label}</span>
      <span className="truncate text-sm text-foreground">{value}</span>
    </div>
  );
}

export function Ok() {
  const router = useRouter();
  const { data: session, isPending } = auth.useSession();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/?auth=sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) return null;
  if (!session?.user) return null;

  const { user, session: currentSession } = session;

  const initials = (user.name ?? user.username ?? user.email ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const expiresAt = currentSession?.expiresAt
    ? dateFormatter.format(new Date(currentSession.expiresAt))
    : "—";

  const device = parseUserAgent(currentSession?.userAgent);
  const DeviceIcon = deviceIcon[device.kind];

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    setVerificationError(null);
    try {
      const result = await auth.sendVerificationEmail({
        email: user.email,
        callbackURL: settings.default.id_url,
      });

      if (result?.error) {
        setVerificationError(
          result.error.message ??
            "Não foi possível enviar o e-mail de verificação. Tente novamente.",
        );
      } else {
        setVerificationSent(true);
      }
    } catch {
      setVerificationError("Não foi possível conectar. Tente novamente em instantes.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col">
      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-xl flex-col px-6 py-8">
          {/* Identidade */}
          <div className="flex items-center gap-5">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? user.username ?? "Avatar"}
                className="size-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                {initials}
              </div>
            )}
  
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                {user.name ?? user.username}
              </h1>
  
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-default-400">
                {user.username ? <span>@{user.username}</span> : null}
                {user.username ? <span>·</span> : null}
                <span>{user.email}</span>
              </div>
            </div>
          </div>
  
          {/* Aviso de e-mail não verificado */}
          {!user.emailVerified && (
            <div className="mt-8 flex items-start gap-3 border-l-2 border-warning-400 pl-4">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-500" />
  
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-sm text-default-600">
                  Seu e-mail ainda não foi verificado. Confirme{" "}
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>{" "}
                  para garantir acesso total à conta.
                </p>
  
                {verificationError && (
                  <p className="text-sm text-danger-600">
                    {verificationError}
                  </p>
                )}
  
                <button
                  type="button"
                  disabled={isSendingVerification || verificationSent}
                  onClick={handleSendVerification}
                  className="w-fit text-sm font-medium text-warning-600 underline underline-offset-4 transition-colors hover:text-warning-700 disabled:cursor-not-allowed disabled:text-default-400 disabled:no-underline"
                >
                  {isSendingVerification
                    ? "Enviando..."
                    : verificationSent
                      ? "E-mail enviado ✓"
                      : "Enviar e-mail de verificação"}
                </button>
              </div>
            </div>
          )}
  
          {/* Último dispositivo */}
          <div className="mt-10 flex flex-col">
            <h2 className="text-xs font-medium uppercase tracking-widest text-default-400">
              Último dispositivo
            </h2>
  
            <div className="mt-3 flex flex-col divide-y divide-default-100">
              <Field
                label="Dispositivo"
                value={
                  <span className="flex items-center justify-end gap-1.5">
                    {device.label}
                    <DeviceIcon className="size-3.5 text-default-300" />
                  </span>
                }
              />
  
              <Field
                label="ID da sessão"
                value={
                  <span
                    className="flex items-center justify-end gap-1.5"
                    title={currentSession?.id}
                  >
                    {currentSession?.id
                      ? `${currentSession.id.slice(0, 10)}…`
                      : "—"}
                    <Fingerprint className="size-3.5 text-default-300" />
                  </span>
                }
              />
  
              <Field
                label="Sessão expira em"
                value={expiresAt}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}