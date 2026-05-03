import {
  ChartPieSlice,
  ChatCircleDots,
  GearSix,
  House,
  Package,
  UploadSimple,
  UsersThree,
} from '@phosphor-icons/react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '../components/ui/sidebar'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'

const ADMIN_NAV_ITEMS = [
  {
    description: 'Inventory, pricing, and product activity',
    icon: ChartPieSlice,
    label: 'Dashboard',
    to: '/admin',
  },
  {
    description: 'Incoming customer purchase requests',
    icon: ChatCircleDots,
    label: 'Contacts',
    to: '/admin/contacts',
  },
  {
    description: 'Bulk product creation from CSV',
    icon: UploadSimple,
    label: 'Import',
    to: '/admin/products/import',
  },
  {
    description: 'Theme, access, and workspace preferences',
    icon: GearSix,
    label: 'Settings',
    to: '/admin/settings',
  },
]

const PAGE_META = {
  '/admin': {
    description: 'Run the storefront like a proper operations dashboard.',
    title: 'Admin dashboard',
  },
  '/admin/contacts': {
    description: 'Track conversations, notes, and customer follow-up.',
    title: 'Customer contacts',
  },
  '/admin/products/import': {
    description: 'Import product data and validate results before publishing.',
    title: 'CSV import',
  },
  '/admin/settings': {
    description: 'Manage account details and visual workspace preferences.',
    title: 'Settings',
  },
  '/admin/users': {
    description: 'Control admin roles, status, and elevated access.',
    title: 'Admin users',
  },
}

function getInitials(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A'
}

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminProfile, isSuperadmin, user } = useAuth()

  const navItems = isSuperadmin
    ? [
        ...ADMIN_NAV_ITEMS,
        {
          description: 'Create, edit, and disable admin accounts',
          icon: UsersThree,
          label: 'Admins',
          to: '/admin/users',
        },
      ]
    : ADMIN_NAV_ITEMS

  const currentMeta = PAGE_META[location.pathname] ?? {
    description: 'Manage products, users, and storefront operations.',
    title: 'Wasabi control',
  }

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-none"
      >
        <SidebarHeader className="gap-3 p-3">
          <div className="rounded-xl border border-sidebar-border bg-sidebar p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/60">
                  Admin workspace
                </p>
              </div>
              <Badge variant="secondary">{adminProfile?.role ?? 'admin'}</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  {getInitials(adminProfile?.name || user?.email || 'Admin')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-sidebar-foreground">
                  {adminProfile?.name || 'Admin user'}
                </p>
                <p className="truncate text-sm text-sidebar-foreground/70">
                  {adminProfile?.email || user?.email || user?.uid}
                </p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = item.to === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.to)

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          'h-auto min-h-12 items-start py-3',
                          isActive && 'bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)]',
                        )}
                        onClick={() => navigate(item.to)}
                      >
                        <item.icon
                          size={18}
                          weight="duotone"
                          className={cn(
                            'mt-0.5 shrink-0',
                            isActive ? 'text-[var(--color-on-accent)]' : 'text-[var(--color-accent)]',
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span
                            className={cn(
                              'mt-1 block text-xs leading-5',
                              isActive ? 'text-[color:rgba(255,255,255,0.82)]' : 'text-sidebar-foreground/65',
                            )}
                          >
                            {item.description}
                          </span>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/')}>
            <House size={18} weight="duotone" />
            Open storefront
          </Button>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-screen bg-transparent">
        <div className="space-y-6 px-4 py-4 md:px-6">
          <Card className="sticky top-4 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.86))] backdrop-blur dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.9))]">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <SidebarTrigger className="mt-1 md:hidden" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Admin panel
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight">{currentMeta.title}</h1>
                  <p className="text-sm text-[var(--color-muted)]">{currentMeta.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">{isSuperadmin ? 'Superadmin access' : 'Admin access'}</Badge>
                <Button variant="secondary" onClick={() => navigate('/admin/products/new')}>
                  <Package size={18} weight="duotone" />
                  New product
                </Button>
              </div>
            </CardContent>
          </Card>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
