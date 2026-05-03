"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavDocuments({ items, onNavigate, pathname }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  className={
                    isActive
                      ? "bg-(--color-accent-soft) text-(--color-accent) hover:bg-(--color-accent-soft) hover:text-(--color-accent)"
                      : ""
                  }
                  onClick={() => onNavigate(item.url)}
                >
                  <item.icon
                    size={16}
                    weight="duotone"
                    className={
                      isActive ? "text-(--color-accent)" : undefined
                    }
                  />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
