"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavMain({ items, onNavigate, pathname }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.url)

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  size="lg"
                  className={cn(
                    "h-auto min-h-12 items-start py-3",
                    isActive && "bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-none hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]",
                  )}
                  onClick={() => onNavigate(item.url)}
                >
                  <item.icon
                    size={18}
                    weight="duotone"
                    className={cn(
                      "mt-0.5 shrink-0",
                      isActive ? "text-[var(--color-accent)]" : "text-[var(--color-accent)]",
                    )}
                  />
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-semibold", isActive && "text-[var(--color-accent)]")}>
                      {item.title}
                    </span>
                    {item.description ? (
                      <span
                        className={cn(
                          "mt-1 block text-xs leading-5",
                          isActive
                            ? "text-[color:rgba(245,110,78,0.78)] dark:text-[color:rgba(255,183,163,0.78)]"
                            : "text-sidebar-foreground/65",
                        )}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
