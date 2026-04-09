import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from '../components/auth/AdminRoute'
import { SuperadminRoute } from '../components/auth/SuperadminRoute'
import { MainLayout } from '../layouts/MainLayout'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { AdminProductImportPage } from '../pages/AdminProductImportPage'
import { AdminSettingsPage } from '../pages/AdminSettingsPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { BasketPage } from '../pages/BasketPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductListPage } from '../pages/ProductListPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="basket" element={<BasketPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/products/import" element={<AdminProductImportPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
        </Route>
        <Route element={<SuperadminRoute />}>
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
