"use client";

import { Button } from "@heroui/react";
import { clsx } from "clsx";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdComputer, MdDarkMode, MdLightMode } from "react-icons/md";

export function Theme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeClasses = "bg-background text-foreground shadow-sm";

  const inactiveClasses =
    "text-foreground/60 hover:text-foreground hover:bg-background/50";

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-xl",
        "border border-default-200/30",
        "bg-background/0 backdrop-blur-xl",
        "p-1",
      )}
    >
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={() => setTheme("light")}
        className={theme === "light" ? activeClasses : inactiveClasses}
      >
        <MdLightMode size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={() => setTheme("dark")}
        className={theme === "dark" ? activeClasses : inactiveClasses}
      >
        <MdDarkMode size={16} />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        onPress={() => setTheme("system")}
        className={theme === "system" ? activeClasses : inactiveClasses}
      >
        <MdComputer size={16} />
      </Button>
    </div>
  );
}
