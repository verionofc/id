"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Description,
  Label,
  Link,
  TextField,
} from "@heroui/react";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { auth } from "@/lib/auth";

type FormErrors = {
  usernameOrEmail?: string;
  password?: string;
};

export function SignIn({ callback }: AuthSignInProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = auth.useSession();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      router.replace(callback ?? "/");
    }
  }, [session, callback, router]);

  const signUpHref = callback
    ? `/?auth=sign-up&callback=${encodeURIComponent(callback)}`
    : "/?auth=sign-up";
  const forgotPasswordHref = callback
    ? `/?auth=forgot-password&callback=${encodeURIComponent(callback)}`
    : "/?auth=forgot-password";

  const handleSubmit: NonNullable<
    React.ComponentProps<"form">["onSubmit"]
  > = async (event) => {
    event.preventDefault();
    setAuthError(null);

    const nextErrors: FormErrors = {};
    if (!usernameOrEmail.trim()) {
      nextErrors.usernameOrEmail = "Informe seu username ou e-mail.";
    }
    if (!password) {
      nextErrors.password = "Informe sua senha.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);
    try {
      const isEmail = usernameOrEmail.includes("@");

      const result = isEmail
        ? await auth.signIn.email({
            email: usernameOrEmail,
            password,
            rememberMe,
            callbackURL: callback,
          })
        : await auth.signIn.username({
            username: usernameOrEmail,
            password,
            rememberMe,
            callbackURL: callback,
          });

      if (result?.error) {
        setAuthError(
          result.error.message ??
            "Não foi possível entrar. Verifique seus dados e tente novamente.",
        );
      }
    } catch {
      setAuthError("Não foi possível conectar. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-full w-full flex-col gap-5 mt-4">
      {authError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{authError}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
        {/* Username ou e-mail — input 100% customizado, sem usar o InputGroup padrão */}
        <TextField
          name="usernameOrEmail"
          isRequired
          isInvalid={!!errors.usernameOrEmail}
          isDisabled={loading}
          className="w-full"
        >
          <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-default-500">
            Username ou e-mail
          </Label>
          <div
            className={[
              "group flex w-full items-center gap-2.5 rounded-xl border bg-content2/40 px-3.5 py-3 transition-all duration-150",
              errors.usernameOrEmail
                ? "border-danger-400 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-500/20"
                : "border-default-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
              loading ? "opacity-60" : "",
            ].join(" ")}
          >
            <Mail
              className={[
                "size-4 shrink-0 transition-colors",
                errors.usernameOrEmail
                  ? "text-danger-500"
                  : "text-default-400 group-focus-within:text-primary",
              ].join(" ")}
            />
            <input
              name="usernameOrEmail"
              type="text"
              placeholder="Digite seu username ou e-mail"
              autoComplete="username"
              disabled={loading}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
            />
          </div>
          {errors.usernameOrEmail ? (
            <Description className="mt-1.5 block text-xs text-danger-600">
              {errors.usernameOrEmail}
            </Description>
          ) : null}
        </TextField>

        <div className="flex w-full flex-col gap-1.5">
          {/* Senha — mesmo tratamento de design custom + toggle de visibilidade */}
          <TextField
            name="password"
            isRequired
            isInvalid={!!errors.password}
            isDisabled={loading}
            className="w-full"
          >
            <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-default-500">
              Senha
            </Label>
            <div
              className={[
                "group flex w-full items-center gap-2.5 rounded-xl border bg-content2/40 px-3.5 py-3 transition-all duration-150",
                errors.password
                  ? "border-danger-400 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-500/20"
                  : "border-default-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                loading ? "opacity-60" : "",
              ].join(" ")}
            >
              <Lock
                className={[
                  "size-4 shrink-0 transition-colors",
                  errors.password
                    ? "text-danger-500"
                    : "text-default-400 group-focus-within:text-primary",
                ].join(" ")}
              />
              <input
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                className="shrink-0 text-default-400 outline-none transition-colors hover:text-default-600"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <Description className="mt-1.5 block text-xs text-danger-600">
                {errors.password}
              </Description>
            ) : null}
          </TextField>

          <Link
            href={forgotPasswordHref}
            className="self-end text-sm text-default-500 hover:text-primary"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <Checkbox
          id="remember-me"
          isSelected={rememberMe}
          onChange={setRememberMe}
          isDisabled={true}
        >
          <Checkbox.Content className="text-sm text-default-600">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Lembrar de mim
          </Checkbox.Content>
        </Checkbox>

        <Button
          variant="primary"
          type="submit"
          isPending={loading}
          fullWidth
          className="w-full font-medium"
        >
          {({ isPending }) => (isPending ? "Conectando…" : "Conectar")}
        </Button>
      </form>

      <p className="text-start text-sm text-default-500">
        Não tem uma conta?{" "}
        <Link href={signUpHref} className="text-sm font-medium">
          Criar conta
        </Link>
        .
      </p>
    </main>
  );
}