"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TbBrandGithub } from "react-icons/tb";
import { Button } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/auth";

import { ApiStatus } from "@/widgets/api/status";
import { Icon } from "@/widgets/Icon";
import { FooterCard } from "@/components/ui/Card";
import { Theme } from "@/widgets/switcher/theme";

export function Footer() {
  const { data: session } = auth.useSession();
  
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await auth.signOut();
      router.replace("/?auth=sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      <FooterCard className="w-full">
        <div className="flex w-full flex-col gap-4 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Icon isOpen />

              <div className="mt-2 flex items-center gap-2">
                <ApiStatus />

                <p className="text-xs text-foreground/60">
                  Verion ID, plataforma de autenticação.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Theme />

              {session?.user ? (
                <Button
                  variant="danger-soft"
                  isPending={isSigningOut}
                  onPress={handleSignOut}
                  className="rounded-lg border border-red-600/10"
                >
                  {({ isPending }) => (
                    <>
                      <LogOut className="size-4" />
                      {isPending ? "Saindo…" : "Sair"}
                    </>
                  )}
                </Button>
              ) : <></>}

              <Link
                href={"/github"}
                target="_blank"
                rel="noreferrer"
                aria-label="Visitar GitHub"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-foreground/10 bg-background/40 text-foreground/75 transition-colors hover:border-foreground/20 hover:bg-background/70 hover:text-foreground"
              >
                <TbBrandGithub size={17} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </FooterCard>
    </motion.div>
  );
}
