"use client"
import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger ref={ref} className={cn(className)} {...props}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", fontSize: 13, fontFamily: "monospace", color: "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none" }}
  >
    {children}
    <span style={{ marginLeft: 8, color: "#5C4A32" }}>{"\u203A"}</span>
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger"

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent ref={ref} className={cn(className)} {...props}
    style={{ background: "#1A1208", border: "1px solid #3D2E1A", borderRadius: 10, padding: 4, minWidth: 160, zIndex: 1000, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
  />
))
ContextMenuSubContent.displayName = "ContextMenuSubContent"

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content ref={ref} className={cn(className)} {...props}
      style={{ background: "#1A1208", border: "1px solid #3D2E1A", borderRadius: 10, padding: 4, minWidth: 200, zIndex: 1000, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = "ContextMenuContent"

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & { variant?: "default" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => (
  <ContextMenuPrimitive.Item ref={ref} className={cn(className)} {...props}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", fontSize: 13, fontFamily: "monospace", color: variant === "destructive" ? "#C47A5A" : "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none", userSelect: "none" }}
    onMouseOver={e => (e.currentTarget.style.background = "#241A0E")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  />
))
ContextMenuItem.displayName = "ContextMenuItem"

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem ref={ref} className={cn(className)} checked={checked} {...props}
    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", fontSize: 13, fontFamily: "monospace", color: "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none" }}
    onMouseOver={e => (e.currentTarget.style.background = "#241A0E")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  >
    <span style={{ color: "#C9A84C", fontSize: 12, width: 16 }}>{checked ? "\u2713" : ""}</span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem ref={ref} className={cn(className)} {...props}
    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", fontSize: 13, fontFamily: "monospace", color: "#F5ECD7", cursor: "pointer", borderRadius: 6, outline: "none" }}
    onMouseOver={e => (e.currentTarget.style.background = "#241A0E")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  >
    <ContextMenuPrimitive.ItemIndicator>
      <span style={{ color: "#C9A84C" }}>{"\u25CF"}</span>
    </ContextMenuPrimitive.ItemIndicator>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = "ContextMenuRadioItem"

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Label ref={ref} className={cn(className)} {...props}
    style={{ padding: "4px 12px", fontSize: 10, fontFamily: "monospace", color: "#5C4A32", letterSpacing: "0.12em", textTransform: "uppercase" }}
  />
))
ContextMenuLabel.displayName = "ContextMenuLabel"

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator ref={ref} className={cn(className)} {...props}
    style={{ height: 1, background: "#3D2E1A", margin: "4px 0" }}
  />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn(className)} {...props} style={{ fontFamily: "monospace", fontSize: 11, color: "#5C4A32", marginLeft: "auto", paddingLeft: 16 }} />
)
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuGroup,
  ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem,
  ContextMenuRadioGroup, ContextMenuLabel, ContextMenuSeparator,
  ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
}
