"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    {/* Left Label */}
    <span className="text-sm text-black">Testnet</span>
    
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-[#e6007a] data-[state=unchecked]:bg-[#07ffff]", // Pink and true blue colors
        "focus-visible:ring-black focus-visible:border-black", // Black focus ring and border
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-black border-2 border-white transition-transform",
          "data-[state=checked]:translate-x-10 data-[state=unchecked]:translate-x-0" // Adjusted translate-x value
        )}
      />
    </SwitchPrimitives.Root>

    {/* Right Label */}
    <span className="text-sm text-black">Kusama</span>
  </div>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
