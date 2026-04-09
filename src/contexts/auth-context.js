import { createContext } from 'react'

export const AuthContext = createContext({
  adminProfile: null,
  authError: '',
  clearAuthError: () => {},
  firebaseReady: false,
  hasAdminAccess: false,
  isAdmin: false,
  isAuthenticated: false,
  isSuperadmin: false,
  loading: true,
  signInAdmin: async () => {},
  signOutUser: async () => {},
  user: null,
})
