import { auth } from "@/lib/auth";

export type Provider = Parameters<
  typeof auth.signIn.social
>[0]["provider"];

export interface ProviderConfig {
  label: string;
}

export interface AuthProvidersProps {
  providers: readonly Provider[];
  actives: Partial<Record<Provider, boolean>>;
  callbackURL?: string;
}