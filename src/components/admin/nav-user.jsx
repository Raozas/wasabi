"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function getInitials(value) {
  return String(value ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A"
}

export function NavUser({ user }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="h-auto py-2">
          <Avatar className="h-10 w-10 rounded-2xl">
            <AvatarFallback className="rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              {getInitials(user.name || user.email || "Admin")}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{user.name}</span>
            <span className="block truncate text-xs text-sidebar-foreground/65">
              {user.email}
            </span>
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
