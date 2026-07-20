
// app/page.tsx
type DefaultAuthType = "sign-in" | "sign-up" | "ok";

type DefaultAuthProps = {
  searchParams: Promise<{
    auth?: string;
    callback?: string;
  }>;
};

// components/auth/page.tsx
type AuthProviderProps = {
  auth: "sign-in" | "sign-up" | "ok";
  callback: string;
};

// components/auth/forms/sign-in.tsx
type AuthSignInProps = {
  callback: string;
};

// components/auth/forms/sign-up.tsx
type AuthSignUpProps = {
  callback: string;
};

// components/auth/providers.tsx
type AuthProviders = {
  github: boolean;
  google: boolean;
};