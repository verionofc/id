import { Separator as HeroSeparator } from "@heroui/react";

export function Separator() {
  return (
    <div className="flex w-full items-center gap-3 mt-4">
      <HeroSeparator className="flex-1" />
      <span className="text-xs text-default-400">ou</span>
      <HeroSeparator className="flex-1" />
    </div>
  )
}