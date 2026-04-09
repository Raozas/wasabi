import {
  CaretRight,
  CheckCircle,
  NotePencil,
  Plus,
  SpinnerGap,
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

  function handleAdminChange(event) {
    const { checked, name, type, value } = event.target
    setAdminForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
        <span className={styles.eyebrow}>
          <UserGear size={16} weight="fill" />
          Superadmin
        </span>
        <h2 className={styles.title}>Admin management</h2>
        <p className={styles.copy}>Manage admin and superadmin access in one dedicated area.</p>
      </div>

      <div className={styles.layout}>
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>
                <UserGear size={16} weight="fill" />
                {editingAdminId ? 'Edit admin' : 'Add admin'}
              </span>
              <h3>{editingAdminId ? 'Update admin access' : 'Create admin profile'}</h3>
            </div>
            {editingAdminId ? (
              <button type="button" className={styles.ghostButton} onClick={resetAdminForm}>
                Cancel
              </button>
            ) : null}
          </div>

          <form className={styles.form} onSubmit={handleAdminSubmit}>
            <label className={styles.field}>
              <span>Firebase UID</span>
              <input name="uid" value={adminForm.uid} onChange={handleAdminChange} required />
            </label>

            <label className={styles.field}>
              <span>Name</span>
              <input name="name" value={adminForm.name} onChange={handleAdminChange} required />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={adminForm.email}
                onChange={handleAdminChange}
                required
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span>Role</span>
                <select name="role" value={adminForm.role} onChange={handleAdminChange}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super admin</option>
                </select>
              </label>

              <label className={styles.toggle}>
                <input
                  name="isActive"
                  type="checkbox"
                  checked={adminForm.isActive}
                  onChange={handleAdminChange}
                />
                <span>Active access</span>
              </label>
            </div>

            {adminError ? <p className={styles.error}>{adminError}</p> : null}
            {adminSuccess ? <p className={styles.success}>{adminSuccess}</p> : null}

            <button type="submit" className={styles.button} disabled={savingAdmins}>
              {savingAdmins ? (
                <>
                  <SpinnerGap size={18} className={styles.spin} />
                  Saving...
                </>
              ) : editingAdminId ? (
                <>
                  <NotePencil size={18} weight="bold" />
                  Update admin
                </>
              ) : (
                <>
                  <Plus size={18} weight="bold" />
                  Create admin
                </>
              )}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>
                <UserGear size={16} weight="fill" />
                Access list
              </span>
              <h3>All admin users</h3>
            </div>
            <span className={styles.count}>{adminUsers.length}</span>
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
                        <span className={styles.category}>{adminUser.role}</span>
                        <span
                          className={
                            adminUser.isActive ? styles.statusAvailable : styles.statusHidden
                          }
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
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.inlineButton}
                      onClick={() => startEditingAdmin(adminUser)}
                    >
                      <NotePencil size={16} weight="bold" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.inlineButton}
                      onClick={() => handleAdminToggle(adminUser.uid, adminUser.isActive)}
                      disabled={savingAdmins}
                    >
                      <CaretRight size={16} weight="bold" />
                      {adminUser.isActive ? 'Disable' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className={styles.inlineDanger}
                      onClick={() => handleAdminDelete(adminUser.uid)}
                      disabled={savingAdmins}
                    >
                      <Trash size={16} weight="bold" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  )
}
