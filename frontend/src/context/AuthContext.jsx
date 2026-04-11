import { createContext, useContext, useState } from 'react'
import { getUser, getToken, clearAuth, isLoggedIn, saveAuth } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(getUser)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)

  const login = (authData) => {
    saveAuth(authData)
    setUser({
      id:    authData.userId,
      email: authData.email,
      name:  authData.name,
      role:  authData.role,
    })
    setLoggedIn(true)
  }

  const logout = () => {
    clearAuth()
    setUser(null)
    setLoggedIn(false)
  }

  const isAdmin = user?.role === 'ADMIN'
  const isUser  = user?.role === 'USER'

  return (
    <AuthContext.Provider value={{ user, loggedIn, isAdmin, isUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)