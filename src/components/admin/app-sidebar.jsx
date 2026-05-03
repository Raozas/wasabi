"use client"

import * as React from "react"
import {
  ChartPieSlice,
  ChatCircleDots,
  GearSix,
  House,
  Package,
  UploadSimple,
  UsersThree,
} from "@phosphor-icons/react"

import { NavDocuments } from "@/components/admin/nav-documents"
import { NavMain } from "@/components/admin/nav-main"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const baseMainItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: ChartPieSlice,
    description: "Inventory, pricing, and product activity",
  },
  {
    title: "Contacts",
    url: "/admin/contacts",
    icon: ChatCircleDots,
    description: "Incoming customer purchase requests",
  },
  {
    title: "Import",
    url: "/admin/products/import",
    icon: UploadSimple,
    description: "Bulk product creation from CSV",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: GearSix,
    description: "Theme, access, and workspace preferences",
  },
]

const baseDocuments = [
  {
    title: "New product",
    url: "/admin/products/new",
    icon: Package,
  },
]

export function AppSidebar({
  adminProfile,
  isSuperadmin,
  pathname,
  user,
  onNavigate,
  ...props
}) {
  const navMain = React.useMemo(() => {
    if (!isSuperadmin) {
      return baseMainItems
    }

    return [
      ...baseMainItems,
      {
        title: "Admins",
        url: "/admin/users",
        icon: UsersThree,
        description: "Create, edit, and disable admin accounts",
      },
    ]
  }, [isSuperadmin])

  const documents = React.useMemo(() => {
    return isSuperadmin
      ? [
          ...baseDocuments,
          {
            title: "Admin access",
            url: "/admin/users",
            icon: UsersThree,
          },
        ]
      : baseDocuments
  }, [isSuperadmin])

  const navSecondary = [
    {
      title: "Open storefront",
      url: "/",
      icon: House,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:p-1.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)]">
                <Package size={18} weight="duotone" />
              </div>
              <span className="text-base font-semibold">Wasabi Control</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} onNavigate={onNavigate} pathname={pathname} />
        <NavDocuments items={documents} onNavigate={onNavigate} pathname={pathname} />
        <NavSecondary items={navSecondary} onNavigate={onNavigate} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: adminProfile?.name || "Admin user",
            email: adminProfile?.email || user?.email || user?.uid || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
