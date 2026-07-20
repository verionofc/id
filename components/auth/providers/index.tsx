"use client";

import { useState } from "react";
import { Button, Spinner } from "@heroui/react";

import { auth } from "@/lib/auth";

import { BrandIcon } from "./icon";
import { PROVIDERS } from "./providers";
import type { AuthProvidersProps, Provider } from "./types";

export function AuthProviders({
  providers,
  actives,
  callbackURL,
}: AuthProvidersProps) {
  const [loading, setLoading] = useState<Provider | null>(null);

  const signIn = async (provider: Provider) => {
    try {
      setLoading(provider);

      await auth.signIn.social({
        provider,
        callbackURL,
      });
    } finally {
      setLoading(null);
    }
  };

  const enabledProviders = providers.filter(
    (provider) => PROVIDERS[provider]
  );

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {enabledProviders.map((provider) => {
        const config = PROVIDERS[provider];

        if (!config) {
          return null;
        }

        const active = actives[provider];
        const isLoading = loading === provider;

        return (
          <Button
            key={provider}
            variant="outline"
            isDisabled={!active || loading !== null}
            className="w-full justify-center gap-3 rounded-lg"
            onPress={() => signIn(provider)}
          >
            {isLoading ? (
              <Spinner
                size="sm"
                color="current"
              />
            ) : (
              <BrandIcon
                provider={provider}
                className="h-5 w-5 text-foreground"
              />
            )}

            {isLoading
              ? "Conectando..."
              : `Continuar com ${config.label}`}
          </Button>
        );
      })}
    </div>
  );
}