"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Description,
  Label,
  Link,
  TextField,
} from "@heroui/react";
import {
  ArrowLeft,
  AtSign,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { auth } from "@/lib/auth";
import { useAuthLoading } from "@/components/auth/loading";

const shakeKeyframes = { x: [0, -8, 8, -8, 8, -4, 4, 0] };
const shakeTransition = { duration: 0.4, ease: "easeInOut" as const };

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type StepOneErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type StepTwoErrors = {
  username?: string;
  avatar?: string;
};

export function SignUp({ callback }: AuthSignUpProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = auth.useSession();

  const [step, setStep] = useState<1 | 2>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const { isLoading: loading, setLoading } = useAuthLoading();
  const [stepOneErrors, setStepOneErrors] = useState<StepOneErrors>({});
  const [stepTwoErrors, setStepTwoErrors] = useState<StepTwoErrors>({});

  const firstNameControls = useAnimation();
  const lastNameControls = useAnimation();
  const emailControls = useAnimation();
  const passwordControls = useAnimation();
  const confirmPasswordControls = useAnimation();
  const usernameControls = useAnimation();
  const avatarControls = useAnimation();

  const triggerShakeStepOne = (fields: Array<keyof StepOneErrors>) => {
    if (fields.includes("firstName")) {
      firstNameControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
    if (fields.includes("lastName")) {
      lastNameControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
    if (fields.includes("email")) {
      emailControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
    if (fields.includes("password")) {
      passwordControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
    if (fields.includes("confirmPassword")) {
      confirmPasswordControls.start({
        ...shakeKeyframes,
        transition: shakeTransition,
      });
    }
  };

  const triggerShakeStepTwo = (fields: Array<keyof StepTwoErrors>) => {
    if (fields.includes("username")) {
      usernameControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
    if (fields.includes("avatar")) {
      avatarControls.start({ ...shakeKeyframes, transition: shakeTransition });
    }
  };

  useEffect(() => {
    if (session?.user) {
      router.replace(callback ?? "/");
    }
  }, [session, callback, router]);

  const signInHref = callback
    ? `/?auth=sign-in&callback=${encodeURIComponent(callback)}`
    : "/?auth=sign-in";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  const handleNext: NonNullable<React.ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();

    const nextErrors: StepOneErrors = {};
    if (!firstName.trim()) {
      nextErrors.firstName = "Informe seu nome.";
    }
    if (!lastName.trim()) {
      nextErrors.lastName = "Informe seu sobrenome.";
    }
    if (!email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (!password) {
      nextErrors.password = "Informe uma senha.";
    } else if (password.length < 8) {
      nextErrors.password = "A senha deve ter ao menos 8 caracteres.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirme sua senha.";
    } else if (password && confirmPassword !== password) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    setStepOneErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      triggerShakeStepOne(Object.keys(nextErrors) as Array<keyof StepOneErrors>);
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStepTwoErrors({});
    setStep(1);
  };

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0];
    // Permite selecionar o mesmo arquivo novamente depois
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStepTwoErrors((prev) => ({
        ...prev,
        avatar: "Selecione um arquivo de imagem válido.",
      }));
      triggerShakeStepTwo(["avatar"]);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setStepTwoErrors((prev) => ({
        ...prev,
        avatar: "A imagem deve ter no máximo 5MB.",
      }));
      triggerShakeStepTwo(["avatar"]);
      return;
    }

    setStepTwoErrors((prev) => ({ ...prev, avatar: undefined }));

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDataUrl(reader.result as string);
    };
    reader.onerror = () => {
      setStepTwoErrors((prev) => ({
        ...prev,
        avatar: "Não foi possível ler a imagem. Tente novamente.",
      }));
      triggerShakeStepTwo(["avatar"]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = async (
    event,
  ) => {
    event.preventDefault();

    const nextErrors: StepTwoErrors = {};
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      nextErrors.username = "Escolha um username.";
    } else if (trimmedUsername.length < 2 || trimmedUsername.length > 32) {
      nextErrors.username = "O username deve ter entre 2 e 32 caracteres.";
    } else if (!usernameRegex.test(trimmedUsername)) {
      nextErrors.username =
        "Use apenas letras, números e underscore, sem espaços.";
    }

    setStepTwoErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      triggerShakeStepTwo(Object.keys(nextErrors) as Array<keyof StepTwoErrors>);
      return;
    }

    setLoading(true);
    try {
      const result = await auth.signUp.email({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        username: trimmedUsername,
        password,
        image: avatarDataUrl ?? undefined,
        callbackURL: callback,
      });

      if (result?.error) {
        // eslint-disable-next-line no-console
        console.error("Erro de cadastro (Better Auth):", result.error);

        // Mensagem genérica: username/e-mail em uso, senha fraca, etc. Better
        // Auth já retorna o motivo em result.error, mas exibimos algo estável
        // pro usuário e mantemos o detalhe só no console.
        const message =
          result.error.message ||
          "Não foi possível criar sua conta. Verifique os dados e tente novamente.";

        setStepTwoErrors({ username: message });
        triggerShakeStepTwo(["username"]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Erro de conexão no cadastro:", err);
      setStepTwoErrors({
        username: "Não foi possível conectar. Tente novamente em instantes.",
      });
      triggerShakeStepTwo(["username"]);
      setLoading(false);
    }
  };

  return (
    <main className="flex h-full w-full flex-col gap-5 mt-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="account"
            onSubmit={handleNext}
            noValidate
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex w-full flex-col gap-4"
          >
            <div className="flex w-full gap-3">
              <TextField
                name="firstName"
                isRequired
                isInvalid={!!stepOneErrors.firstName}
                isDisabled={loading}
                className="w-full"
              >
                <Label
                  className={[
                    "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                    stepOneErrors.firstName ? "text-red-600" : "text-default-500",
                  ].join(" ")}
                >
                  Nome
                </Label>
                <motion.div
                  animate={firstNameControls}
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                    stepOneErrors.firstName
                      ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                      : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                    loading ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <User
                    className={[
                      "size-4 shrink-0 transition-colors",
                      stepOneErrors.firstName
                        ? "text-red-500"
                        : "text-default-400 group-focus-within:text-primary",
                    ].join(" ")}
                  />
                  <input
                    name="firstName"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="given-name"
                    disabled={loading}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (stepOneErrors.firstName) {
                        setStepOneErrors((prev) => ({
                          ...prev,
                          firstName: undefined,
                        }));
                      }
                    }}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
                  />
                </motion.div>
                {stepOneErrors.firstName && stepOneErrors.firstName.trim() ? (
                  <Description className="mt-1.5 block text-xs font-medium text-red-600">
                    {stepOneErrors.firstName}
                  </Description>
                ) : null}
              </TextField>

              <TextField
                name="lastName"
                isRequired
                isInvalid={!!stepOneErrors.lastName}
                isDisabled={loading}
                className="w-full"
              >
                <Label
                  className={[
                    "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                    stepOneErrors.lastName ? "text-red-600" : "text-default-500",
                  ].join(" ")}
                >
                  Sobrenome
                </Label>
                <motion.div
                  animate={lastNameControls}
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                    stepOneErrors.lastName
                      ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                      : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                    loading ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <User
                    className={[
                      "size-4 shrink-0 transition-colors",
                      stepOneErrors.lastName
                        ? "text-red-500"
                        : "text-default-400 group-focus-within:text-primary",
                    ].join(" ")}
                  />
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Seu sobrenome"
                    autoComplete="family-name"
                    disabled={loading}
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (stepOneErrors.lastName) {
                        setStepOneErrors((prev) => ({
                          ...prev,
                          lastName: undefined,
                        }));
                      }
                    }}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
                  />
                </motion.div>
                {stepOneErrors.lastName && stepOneErrors.lastName.trim() ? (
                  <Description className="mt-1.5 block text-xs font-medium text-red-600">
                    {stepOneErrors.lastName}
                  </Description>
                ) : null}
              </TextField>
            </div>

            <TextField
              name="email"
              isRequired
              isInvalid={!!stepOneErrors.email}
              isDisabled={loading}
              className="w-full"
            >
              <Label
                className={[
                  "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                  stepOneErrors.email ? "text-red-600" : "text-default-500",
                ].join(" ")}
              >
                E-mail
              </Label>
              <motion.div
                animate={emailControls}
                className={[
                  "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                  stepOneErrors.email
                    ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                    : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                  loading ? "opacity-60" : "",
                ].join(" ")}
              >
                <Mail
                  className={[
                    "size-4 shrink-0 transition-colors",
                    stepOneErrors.email
                      ? "text-red-500"
                      : "text-default-400 group-focus-within:text-primary",
                  ].join(" ")}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (stepOneErrors.email) {
                      setStepOneErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
                />
              </motion.div>
              {stepOneErrors.email && stepOneErrors.email.trim() ? (
                <Description className="mt-1.5 block text-xs font-medium text-red-600">
                  {stepOneErrors.email}
                </Description>
              ) : null}
            </TextField>

            <TextField
              name="password"
              isRequired
              isInvalid={!!stepOneErrors.password}
              isDisabled={loading}
              className="w-full"
            >
              <Label
                className={[
                  "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                  stepOneErrors.password ? "text-red-600" : "text-default-500",
                ].join(" ")}
              >
                Senha
              </Label>
              <motion.div
                animate={passwordControls}
                className={[
                  "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                  stepOneErrors.password
                    ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                    : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                  loading ? "opacity-60" : "",
                ].join(" ")}
              >
                <Lock
                  className={[
                    "size-4 shrink-0 transition-colors",
                    stepOneErrors.password
                      ? "text-red-500"
                      : "text-default-400 group-focus-within:text-primary",
                  ].join(" ")}
                />
                <input
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (stepOneErrors.password) {
                      setStepOneErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  className={[
                    "shrink-0 outline-none transition-colors",
                    stepOneErrors.password
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
              {stepOneErrors.password && stepOneErrors.password.trim() ? (
                <Description className="mt-1.5 block text-xs font-medium text-red-600">
                  {stepOneErrors.password}
                </Description>
              ) : null}
            </TextField>

            <TextField
              name="confirmPassword"
              isRequired
              isInvalid={!!stepOneErrors.confirmPassword}
              isDisabled={loading}
              className="w-full"
            >
              <Label
                className={[
                  "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                  stepOneErrors.confirmPassword
                    ? "text-red-600"
                    : "text-default-500",
                ].join(" ")}
              >
                Confirmar senha
              </Label>
              <motion.div
                animate={confirmPasswordControls}
                className={[
                  "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                  stepOneErrors.confirmPassword
                    ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                    : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                  loading ? "opacity-60" : "",
                ].join(" ")}
              >
                <Lock
                  className={[
                    "size-4 shrink-0 transition-colors",
                    stepOneErrors.confirmPassword
                      ? "text-red-500"
                      : "text-default-400 group-focus-within:text-primary",
                  ].join(" ")}
                />
                <input
                  name="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (stepOneErrors.confirmPassword) {
                      setStepOneErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  aria-label={
                    isConfirmPasswordVisible ? "Ocultar senha" : "Mostrar senha"
                  }
                  className={[
                    "shrink-0 outline-none transition-colors",
                    stepOneErrors.confirmPassword
                      ? "text-red-500 hover:text-red-600"
                      : "text-default-400 hover:text-default-600",
                  ].join(" ")}
                  onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </motion.div>
              {stepOneErrors.confirmPassword &&
              stepOneErrors.confirmPassword.trim() ? (
                <Description className="mt-1.5 block text-xs font-medium text-red-600">
                  {stepOneErrors.confirmPassword}
                </Description>
              ) : null}
            </TextField>

            <Button
              variant="primary"
              type="submit"
              fullWidth
              className="w-full font-medium"
            >
              Continuar
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="username"
            onSubmit={handleSubmit}
            noValidate
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex w-full flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2 py-1">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading}
                onChange={handleAvatarChange}
              />
              <motion.button
                type="button"
                animate={avatarControls}
                disabled={loading}
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Enviar foto de perfil"
                className={[
                  "group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-150",
                  stepTwoErrors.avatar
                    ? "border-red-500"
                    : "border-default-200 hover:border-primary",
                  loading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                ].join(" ")}
              >
                {avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarDataUrl}
                    alt="Prévia da foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus
                    className={[
                      "size-6 transition-colors",
                      stepTwoErrors.avatar
                        ? "text-red-500"
                        : "text-default-400 group-hover:text-primary",
                    ].join(" ")}
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5 text-white" />
                </span>
              </motion.button>
              <span className="text-xs text-default-500">
                Foto de perfil (opcional, máx. 5MB)
              </span>
              {stepTwoErrors.avatar && stepTwoErrors.avatar.trim() ? (
                <span className="text-xs font-medium text-red-600">
                  {stepTwoErrors.avatar}
                </span>
              ) : null}
            </div>

            <TextField
              name="username"
              isRequired
              isInvalid={!!stepTwoErrors.username}
              isDisabled={loading}
              className="w-full"
            >
              <Label
                className={[
                  "mb-1.5 block text-xs font-medium uppercase tracking-wide transition-colors",
                  stepTwoErrors.username ? "text-red-600" : "text-default-500",
                ].join(" ")}
              >
                Username
              </Label>
              <motion.div
                animate={usernameControls}
                className={[
                  "group flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-150",
                  stepTwoErrors.username
                    ? "border-red-500 bg-transparent focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                    : "border-default-200 bg-content2/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-default-300",
                  loading ? "opacity-60" : "",
                ].join(" ")}
              >
                <AtSign
                  className={[
                    "size-4 shrink-0 transition-colors",
                    stepTwoErrors.username
                      ? "text-red-500"
                      : "text-default-400 group-focus-within:text-primary",
                  ].join(" ")}
                />
                <input
                  name="username"
                  type="text"
                  placeholder="username"
                  autoComplete="off"
                  disabled={loading}
                  value={username}
                  minLength={2}
                  maxLength={32}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (stepTwoErrors.username) {
                      setStepTwoErrors((prev) => ({
                        ...prev,
                        username: undefined,
                      }));
                    }
                  }}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-default-400 disabled:cursor-not-allowed"
                />
              </motion.div>
              {stepTwoErrors.username && stepTwoErrors.username.trim() ? (
                <Description className="mt-1.5 block text-xs font-medium text-red-600">
                  {stepTwoErrors.username}
                </Description>
              ) : null}
            </TextField>

            <div className="flex w-full items-center gap-3">
              <Button
                variant="ghost"
                type="button"
                isIconOnly
                isDisabled={loading}
                aria-label="Voltar"
                className="shrink-0 hover:bg-transparent"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant="primary"
                type="submit"
                isPending={loading}
                className="flex-1 font-medium"
              >
                {({ isPending }) => (isPending ? "Criando…" : "Criar conta")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-start text-sm text-default-500">
        Já tem uma conta?{" "}
        <Link href={signInHref} className="text-sm font-medium">
          Entrar
        </Link>
        .
      </p>
    </main>
  );
}