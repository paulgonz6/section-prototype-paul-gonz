"use client"

import { type ComponentProps } from "react"
import { GripVertical } from "lucide-react"
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
} from "react-resizable-panels"

function ResizablePanelGroup({
  className,
  ...props
}: ComponentProps<typeof Group>) {
  return (
    <Group
      className={`h-full w-full ${className ?? ""}`}
      {...props}
    />
  )
}

const ResizablePanel = Panel

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      className={`relative flex w-px items-center justify-center bg-border ${className ?? ""}`}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle, usePanelRef }
