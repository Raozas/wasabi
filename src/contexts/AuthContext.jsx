import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { ADMIN_ROUTE_ROLES } from '../config/firebase-schema'
import { getAdminUserByUid } from '../services/firestore/admin-users'
import { AuthContext } from './auth-context'
import { auth, firebaseReady } from '../services/firebase'

export { AuthContext }

export function AuthProvider({ children }) {
  const [adminProfile, setAdminProfile] = useState(null)
  const [authError, setAuthError] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseReady)

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true)
      setUser(nextUser)
      setAuthError('')

      if (!nextUser) {
        setAdminProfile(null)
        setLoading(false)
        return
      }

      try {
        const profile = await getAdminUserByUid(nextUser.uid)
        setAdminProfile(profile)
      } catch (error) {
        setAdminProfile(null)
        setAuthError(error instanceof Error ? error.message : 'Failed to resolve admin profile.')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  async function signInAdmin(email, password) {
    if (!auth || !firebaseReady) {
      throw new Error('Firebase Authentication is not configured.')
    }

    setAuthError('')
    setLoading(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getAdminUserByUid(credential.user.uid)

      if (!profile || !profile.isActive || !ADMIN_ROUTE_ROLES.includes(profile.role)) {
        await signOut(auth)
        throw new Error('This account does not have active admin access.')
      }

      setUser(credential.user)
      setAdminProfile(profile)
      return profile
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Unable to sign in with the provided credentials.'
      setAdminProfile(null)
      setAuthError(nextMessage)
      throw new Error(nextMessage)
    } finally {
      setLoading(false)
    }
  }

  async function signOutUser() {
    if (!auth || !firebaseReady) {
      setUser(null)
      setAdminProfile(null)
      return
    }

    await signOut(auth)
    setUser(null)
    setAdminProfile(null)
    setAuthError('')
  }

  function clearAuthError() {
    setAuthError('')
  }

  const isAuthenticated = Boolean(user)
  const isSuperadmin =
    Boolean(user) && Boolean(adminProfile?.isActive) && adminProfile?.role === 'superadmin'
  const isAdmin =
    Boolean(user) &&
    Boolean(adminProfile?.isActive) &&
    (adminProfile?.role === 'admin' || adminProfile?.role === 'superadmin')
  const hasAdminAccess =
    isAdmin

  const value = useMemo(
    () => ({
      adminProfile,
      authError,
      clearAuthError,
      firebaseReady,
      hasAdminAccess,
      isAdmin,
      isAuthenticated,
      isSuperadmin,
      loading,
      signInAdmin,
      signOutUser,
      user,
    }),
    [adminProfile, authError, hasAdminAccess, isAdmin, isAuthenticated, isSuperadmin, loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
