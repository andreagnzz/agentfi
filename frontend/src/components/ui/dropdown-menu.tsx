"use client"
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger ref={ref} className={cn(className)} {...props}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", fontSize: 13, fontFamily: "monospace", color: "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none", userSelect: "none" }}
    onMouseOver={e => (e.currentTarget.style.background = "#241A0E")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  >
    {children}
    <span style={{ marginLeft: 8, color: "#5C4A32" }}>{"\u203A"}</span>
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent ref={ref} className={cn(className)} {...props}
    style={{ background: "#1A1208", border: "1px solid #3D2E1A", borderRadius: 10, padding: 4, minWidth: 160, zIndex: 1000, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
  />
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn(className)} {...props}
      style={{ background: "#1A1208", border: "1px solid #3D2E1A", borderRadius: 10, padding: 4, minWidth: 160, zIndex: 1000, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { variant?: "default" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item ref={ref} className={cn(className)} {...props}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", fontSize: 13, fontFamily: "monospace", color: variant === "destructive" ? "#C47A5A" : "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none", userSelect: "none" }}
    onMouseOver={e => { if (!props.disabled) e.currentTarget.style.background = "#241A0E" }}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={cn(className)} {...props}
    style={{ padding: "4px 12px", fontSize: 10, fontFamily: "monospace", color: "#5C4A32", letterSpacing: "0.12em", textTransform: "uppercase" }}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn(className)} {...props}
    style={{ height: 1, background: "#3D2E1A", margin: "4px 0" }}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn(className)} {...props}
    style={{ fontFamily: "monospace", fontSize: 11, color: "#5C4A32", marginLeft: "auto", paddingLeft: 16 }}
  />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn(className)} checked={checked} {...props}
    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", fontSize: 13, fontFamily: "monospace", color: "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none" }}
    onMouseOver={e => (e.currentTarget.style.background = "#241A0E")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  >
    <span style={{ color: "#C9A84C", fontSize: 12, width: 16 }}>{checked ? "\u2713" : ""}</span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem ref={ref} className={cn(className)} {...props}
    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", fontSize: 13, fontFamily: "monospace", color: "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none" }}
    onMouseOver={e => (e.currentTarget.style.background = "#241A0E")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  >
    <DropdownMenuPrimitive.ItemIndicator>
      <span style={{ color: "#C9A84C" }}>{"\u25CF"}</span>
    </DropdownMenuPrimitive.ItemIndicator>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem,
  DropdownMenuRadioGroup, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuPortal,
}
