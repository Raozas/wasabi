import { Package } from '@phosphor-icons/react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppSidebar } from '../components/admin/app-sidebar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { useAuth } from '../hooks/useAuth'

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

function getCurrentMeta(pathname) {
  if (pathname.startsWith('/admin/contacts/')) {
    return {
      description: 'Review the selected request, save notes, and track the conversation outcome.',
      title: 'Request detail',
    }
  }

  if (pathname.startsWith('/admin/products/') && pathname.endsWith('/edit')) {
    return {
      description: 'Update product content, pricing, media, and storefront visibility.',
      title: 'Edit product',
    }
  }

  if (pathname === '/admin/products/new') {
    return {
      description: 'Create a new product for the storefront and prepare it for publishing.',
      title: 'New product',
    }
  }

  return PAGE_META[pathname] ?? {
    description: 'Manage products, users, and storefront operations.',
    title: 'Wasabi control',
  }
}

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminProfile, isSuperadmin, user } = useAuth()

  const currentMeta = getCurrentMeta(location.pathname)

  return (
    <SidebarProvider>
      <AppSidebar
        adminProfile={adminProfile}
        isSuperadmin={isSuperadmin}
        pathname={location.pathname}
        user={user}
        onNavigate={navigate}
      />

      <SidebarInset className="min-h-screen bg-transparent [--header-height:calc(--spacing(14))]">
        <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-medium">{currentMeta.title}</h1>
              <p className="hidden text-sm text-(--color-muted) lg:block">
                {currentMeta.description}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline">{isSuperadmin ? 'Superadmin access' : 'Admin access'}</Badge>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products/new')}>
                <Package size={16} weight="duotone" />
                New product
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 md:px-6">
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
