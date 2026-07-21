"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthLoadingContextType {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
}

const AuthLoadingContext = createContext<AuthLoadingContextType>({
  isLoading: false,
  setLoading: () => {},
});

export function useAuthLoading() {
  return useContext(AuthLoadingContext);
}

export function AuthLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AuthLoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-2.5 rounded-full bg-foreground"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLoadingContext.Provider>
  );
}
