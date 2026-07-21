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
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { auth } from "@/lib/auth";
import { useAuthLoading } from "@/components/auth/loading";

const shakeKeyframes = { x: [0, -8, 8, -8, 8, -4, 4, 0] };
const shakeTransition = { duration: 0.4, ease: "easeInOut" as const };

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
  const [errors, setErrors] = useState<FormErrors>({});

  const { isLoading: loading, setLoading } = useAuthLoading();
  const usernameControls = useAnimation();
  const passwordControls = useAnimation();

  const triggerShake = (fields: Array<keyof FormErrors>) => {
    if (fields.includes("usernameOrEmail")) {
      usernameControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
    if (fields.includes("password")) {
      passwordControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
  };

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

    const nextErrors: FormErrors = {};
    if (!usernameOrEmail.trim()) {
      nextErrors.usernameOrEmail = "Informe seu username ou e-mail.";
    }
    if (!password) {
      nextErrors.password = "Informe sua senha.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      triggerShake(Object.keys(nextErrors) as Array<keyof FormErrors>);
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
        // eslint-disable-next-line no-console
        console.error("Erro de login (Better Auth):", result.error);

        // Importante: o Better Auth retorna um erro genérico (401/UNAUTHORIZED)
        // tanto para "usuário não existe" quanto para "senha errada", de propósito,
        // pra evitar que alguém descubra quais e-mails/usernames existem testando
        // senhas aleatórias (user enumeration). Por isso NÃO dá pra (nem deve)
        // diferenciar qual campo está errado — mostramos uma mensagem genérica.
        const message =
          result.error.message ||
          "Username/e-mail ou senha incorretos.";

        setErrors({
          usernameOrEmail: message,
          password: message,
        });
        triggerShake(["usernameOrEmail", "password"]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Erro de conexão no login:", err);
      const connMessage = "Não foi possível conectar. Tente novamente em instantes.";
      setErrors({
        usernameOrEmail: connMessage,
        password: connMessage,
      });
      triggerShake(["usernameOrEmail", "password"]);
      setLoading(false);
    }
  };

  return (
    <main className="flex h-full w-full flex-col gap-5 mt-4">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
        {/* Username ou e-mail — input 100% customizado, sem usar o InputGroup padrão */}
        <TextField
          name="usernameOrEmail"
          isRequired
          isInvalid={!!errors.usernameOrEmail}
          isDisabled={loading}
          className="w-full"
        >
          <Label
            className={[
              "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
              errors.usernameOrEmail ? "text-red-600" : "text-default-500",
            ].join(" ")}
          >
            Username ou e-mail
          </Label>
          <motion.div
            animate={usernameControls}
            className={[
              "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
              errors.usernameOrEmail
                ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
              loading ? "opacity-60" : "",
            ].join(" ")}
          >
            <Mail
              className={[
                "size-4 shrink-0 transition-colors",
                errors.usernameOrEmail
                  ? "text-red-500"
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
              onChange={(e) => {
                setUsernameOrEmail(e.target.value);
                if (errors.usernameOrEmail) {
                  setErrors((prev) => ({ ...prev, usernameOrEmail: undefined }));
                }
              }}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
            />
          </motion.div>
          {errors.usernameOrEmail && errors.usernameOrEmail.trim() ? (
            <Description className="mt-1.5 block text-xs font-medium text-red-600">
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
            <Label
              className={[
                "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                errors.password ? "text-red-600" : "text-default-500",
              ].join(" ")}
            >
              Senha
            </Label>
            <motion.div
              animate={passwordControls}
              className={[
                "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                errors.password
                  ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                  : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                loading ? "opacity-60" : "",
              ].join(" ")}
            >
              <Lock
                className={[
                  "size-4 shrink-0 transition-colors",
                  errors.password
                    ? "text-red-500"
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                className={[
                  "shrink-0 outline-none transition-colors",
                  errors.password
                    ? "text-red-500 hover:text-red-600"
                    : "text-default-400 hover:text-default-600",
                ].join(" ")}
                onClick={() => setIsPasswordVisible((prev) => !prev)}
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </motion.div>
            {errors.password && errors.password.trim() ? (
              <Description className="mt-1.5 block text-xs font-medium text-red-600">
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