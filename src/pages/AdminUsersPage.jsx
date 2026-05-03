import {
  CaretRight,
  CheckCircle,
  NotePencil,
  Plus,
  Trash,
  UserGear,
  XCircle,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  setAdminUserStatus,
  updateAdminUser,
} from '../services/firestore/admin-users'
import { cn } from '../lib/utils'

const INITIAL_ADMIN_FORM = {
  email: '',
  isActive: true,
  name: '',
  role: 'admin',
  uid: '',
}

export function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [savingAdmins, setSavingAdmins] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [adminForm, setAdminForm] = useState(INITIAL_ADMIN_FORM)

  useEffect(() => {
    void loadAdminUsers()
  }, [])

  async function loadAdminUsers() {
    setLoadingAdmins(true)
    setAdminError('')

    try {
      const nextAdminUsers = await listAdminUsers()
      setAdminUsers(nextAdminUsers)
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Failed to load admin users.')
    } finally {
      setLoadingAdmins(false)
    }
  }

  function resetAdminForm() {
    setEditingAdminId(null)
    setAdminForm(INITIAL_ADMIN_FORM)
  }

  function startEditingAdmin(adminUser) {
    setEditingAdminId(adminUser.uid)
    setAdminForm({
      email: adminUser.email ?? '',
      isActive: Boolean(adminUser.isActive),
      name: adminUser.name ?? '',
      role: adminUser.role ?? 'admin',
      uid: adminUser.uid ?? '',
    })
    setAdminSuccess('')
    setAdminError('')
  }

  async function handleAdminSubmit(event) {
    event.preventDefault()
    setSavingAdmins(true)
    setAdminError('')
    setAdminSuccess('')

    try {
      const payload = {
        email: adminForm.email,
        isActive: adminForm.isActive,
        name: adminForm.name,
        role: adminForm.role,
        uid: adminForm.uid,
      }

      if (editingAdminId) {
        await updateAdminUser(editingAdminId, payload)
      } else {
        await createAdminUser(payload)
      }

      await loadAdminUsers()
      resetAdminForm()
      setAdminSuccess(editingAdminId ? 'Admin updated.' : 'Admin created.')
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Failed to save admin user.')
    } finally {
      setSavingAdmins(false)
    }
  }

  async function handleAdminDelete(uid) {
    setSavingAdmins(true)
    setAdminError('')
    setAdminSuccess('')

    try {
      await deleteAdminUser(uid)
      if (editingAdminId === uid) {
        resetAdminForm()
      }
      await loadAdminUsers()
      setAdminSuccess('Admin removed.')
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Failed to delete admin user.')
    } finally {
      setSavingAdmins(false)
    }
  }

  async function handleAdminToggle(uid, isActive) {
    setSavingAdmins(true)
    setAdminError('')
    setAdminSuccess('')

    try {
      await setAdminUserStatus(uid, !isActive)
      await loadAdminUsers()
      setAdminSuccess(!isActive ? 'Admin activated.' : 'Admin disabled.')
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Failed to update admin status.')
    } finally {
      setSavingAdmins(false)
    }
  }

  function getStatusBadgeClass(isActive) {
    return isActive
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="secondary">
                  <UserGear size={14} weight="fill" />
                  {editingAdminId ? 'Edit admin' : 'Add admin'}
                </Badge>
                <div>
                  <CardTitle className="text-2xl">
                    {editingAdminId ? 'Update admin access' : 'Create admin profile'}
                  </CardTitle>
                  <CardDescription>
                    Manage UID-based admin access for the Wasabi control panel.
                  </CardDescription>
                </div>
              </div>
              {editingAdminId ? (
                <Button variant="ghost" onClick={resetAdminForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleAdminSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Firebase UID</label>
                <Input
                  value={adminForm.uid}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, uid: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={adminForm.name}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Textarea
                  rows={1}
                  value={adminForm.role}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, role: event.target.value }))
                  }
                  placeholder="Use admin or superadmin."
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={adminForm.isActive}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                  className="h-5 w-5 accent-[var(--color-accent)]"
                />
                <span className="text-sm font-medium">Active access</span>
              </label>

              {adminError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
                  {adminError}
                </div>
              ) : null}

              {adminSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {adminSuccess}
                </div>
              ) : null}

              <Button type="submit" disabled={savingAdmins} className="w-full">
                {editingAdminId ? <NotePencil size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
                {savingAdmins ? 'Saving...' : editingAdminId ? 'Update admin' : 'Create admin'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
          <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary">
                <UserGear size={14} weight="fill" />
                Access list
              </Badge>
              <div>
                <CardTitle className="text-2xl">All admin users</CardTitle>
                <CardDescription>
                  Audit active access, update roles, and remove accounts you no longer want in the
                  panel.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline">{adminUsers.length} admins</Badge>
          </CardHeader>

          <CardContent>
            {loadingAdmins ? (
              <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
                Loading admins...
              </div>
            ) : null}

            {!loadingAdmins && adminUsers.length === 0 ? (
              <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
                No admin users yet.
              </div>
            ) : null}

            {!loadingAdmins && adminUsers.length > 0 ? (
              <div className="space-y-4">
                {adminUsers.map((adminUser) => (
                  <article
                    key={adminUser.uid}
                    className="grid gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[84px_minmax(0,1fr)]">
                      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-accent)]">
                        <UserGear size={24} weight="duotone" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-semibold">{adminUser.name}</p>
                            <p className="text-sm text-[var(--color-muted)]">{adminUser.email}</p>
                          </div>
                          <p className="max-w-full truncate text-sm font-medium text-[var(--color-accent)] md:max-w-64">
                            {adminUser.uid}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{adminUser.role}</Badge>
                          <Badge
                            variant="outline"
                            className={cn(getStatusBadgeClass(adminUser.isActive))}
                          >
                            {adminUser.isActive ? (
                              <>
                                <CheckCircle size={14} weight="fill" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} weight="fill" />
                                Disabled
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => startEditingAdmin(adminUser)}>
                        <NotePencil size={16} weight="bold" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        disabled={savingAdmins}
                        onClick={() => handleAdminToggle(adminUser.uid, adminUser.isActive)}
                      >
                        <CaretRight size={16} weight="bold" />
                        {adminUser.isActive ? 'Disable' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={savingAdmins}
                        onClick={() => handleAdminDelete(adminUser.uid)}
                      >
                        <Trash size={16} weight="bold" />
                        Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
