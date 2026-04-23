import { Button, Card, Chip, Input, Spinner, TextArea } from '@heroui/react'
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
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  setAdminUserStatus,
  updateAdminUser,
} from '../services/firestore/admin-users'
import styles from './AdminUsersPage.module.css'

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

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <Chip color="primary" variant="flat">
          <UserGear size={16} weight="fill" />
          Superadmin
        </Chip>
        <h2 className={styles.title}>Admin management</h2>
        <p className={styles.copy}>Manage admin and superadmin access in one dedicated area.</p>
      </div>

      <div className={styles.layout}>
        <Card className={styles.card}>
          <Card.Content>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionKicker}>
                  <UserGear size={16} weight="fill" />
                  {editingAdminId ? 'Edit admin' : 'Add admin'}
                </span>
                <h3>{editingAdminId ? 'Update admin access' : 'Create admin profile'}</h3>
              </div>
              {editingAdminId ? (
                <Button type="button" variant="light" onClick={resetAdminForm}>
                  Cancel
                </Button>
              ) : null}
            </div>

            <form className={styles.form} onSubmit={handleAdminSubmit}>
              <Input
                label="Firebase UID"
                value={adminForm.uid}
                onChange={(event) => setAdminForm((current) => ({ ...current, uid: event.target.value }))}
                required
              />
              <Input
                label="Name"
                value={adminForm.name}
                onChange={(event) => setAdminForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={adminForm.email}
                onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
              <TextArea
                label="Role"
                value={adminForm.role}
                onChange={(event) => setAdminForm((current) => ({ ...current, role: event.target.value }))}
                description="Use admin or superadmin."
                minRows={1}
              />

              <label className={styles.toggle}>
                <input
                  name="isActive"
                  type="checkbox"
                  checked={adminForm.isActive}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                <span>Active access</span>
              </label>

              {adminError ? <p className={styles.error}>{adminError}</p> : null}
              {adminSuccess ? <p className={styles.success}>{adminSuccess}</p> : null}

              <Button type="submit" color="primary" isDisabled={savingAdmins}>
                {savingAdmins ? <Spinner size="sm" /> : editingAdminId ? <NotePencil size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
                {editingAdminId ? 'Update admin' : 'Create admin'}
              </Button>
            </form>
          </Card.Content>
        </Card>

        <Card className={styles.card}>
          <Card.Content>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionKicker}>
                  <UserGear size={16} weight="fill" />
                  Access list
                </span>
                <h3>All admin users</h3>
              </div>
              <Chip variant="flat">{adminUsers.length}</Chip>
            </div>

            {loadingAdmins ? <div className={styles.state}>Loading admins...</div> : null}
            {!loadingAdmins && adminUsers.length === 0 ? (
              <div className={styles.state}>No admin users yet.</div>
            ) : null}

            {!loadingAdmins && adminUsers.length > 0 ? (
              <div className={styles.itemList}>
                {adminUsers.map((adminUser) => (
                  <article key={adminUser.uid} className={styles.itemCard}>
                    <div className={styles.mediaSummary}>
                      <div className={styles.previewFallback}>
                        <UserGear size={22} weight="duotone" />
                      </div>

                      <div className={styles.itemInfo}>
                        <div className={styles.itemTop}>
                          <strong>{adminUser.name}</strong>
                          <span className={styles.uidText}>{adminUser.uid}</span>
                        </div>
                        <p>{adminUser.email}</p>
                        <div className={styles.metaRow}>
                          <Chip variant="flat">{adminUser.role}</Chip>
                          <Chip color={adminUser.isActive ? 'success' : 'danger'} variant="flat">
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
                          </Chip>
                        </div>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <Button variant="bordered" onClick={() => startEditingAdmin(adminUser)}>
                        <NotePencil size={16} weight="bold" />
                        Edit
                      </Button>
                      <Button
                        variant="bordered"
                        onClick={() => handleAdminToggle(adminUser.uid, adminUser.isActive)}
                        isDisabled={savingAdmins}
                      >
                        <CaretRight size={16} weight="bold" />
                        {adminUser.isActive ? 'Disable' : 'Activate'}
                      </Button>
                      <Button
                        color="danger"
                        variant="light"
                        onClick={() => handleAdminDelete(adminUser.uid)}
                        isDisabled={savingAdmins}
                      >
                        <Trash size={16} weight="bold" />
                        Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </Card.Content>
        </Card>
      </div>
    </section>
  )
}
