"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode
  content: string
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          sideOffset={4}
          className="z-50 max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-foreground" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
