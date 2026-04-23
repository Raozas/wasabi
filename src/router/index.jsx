import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from '../components/auth/AdminRoute'
import { SuperadminRoute } from '../components/auth/SuperadminRoute'
import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminContactsPage } from '../pages/AdminContactsPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { AdminProductEditorPage } from '../pages/AdminProductEditorPage'
import { AdminProductImportPage } from '../pages/AdminProductImportPage'
import { AdminSettingsPage } from '../pages/AdminSettingsPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { BasketPage } from '../pages/BasketPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ProductListPage } from '../pages/ProductListPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="basket" element={<BasketPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/contacts" element={<AdminContactsPage />} />
          <Route path="admin/products/new" element={<AdminProductEditorPage />} />
          <Route path="admin/products/:productId/edit" element={<AdminProductEditorPage />} />
          <Route path="admin/products/import" element={<AdminProductImportPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
      <Route element={<SuperadminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
