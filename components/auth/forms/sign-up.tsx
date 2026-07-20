"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { auth } from "@/lib/auth";

export function SignUp({ callback }: AuthSignUpProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [username, setUsername] = useState("");

  const next = () => {
    if (!firstName || !lastName || !email || !password) return;

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    setStep(2);
  };

  const back = () => setStep(1);

  const submit = async () => {
    await auth.signUp.email({
      name: `${firstName} ${lastName}`,
      email,
      username,
      password,
      callbackURL: callback,
    });
  };

  return (
    <main>
      <h1>Sign Up</h1>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="account"
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div>
              <label>First name</label>
              <br />
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label>Last name</label>
              <br />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label>Email</label>
              <br />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label>Password</label>
              <br />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label>Confirm Password</label>
              <br />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <br />

            <button type="button" onClick={next}>
              Continuar
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="username"
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2>Escolha seu @username</h2>

            <p>
              Este nome será único e não poderá conter caracteres inválidos.
            </p>

            <label>@Username</label>
            <br />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              minLength={2}
              maxLength={32}
            />

            <br />
            <br />

            <button type="button" onClick={back}>
              Voltar
            </button>

            {" "}

            <button type="button" onClick={submit}>
              Criar conta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}