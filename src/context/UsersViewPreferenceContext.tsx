import { createContext, useContext, useState, ReactNode } from 'react'

type UserViewType = 'original' | 'management'

interface UsersViewPreferenceContextType {
  viewType: UserViewType
  setViewType: (type: UserViewType) => void
}

const UsersViewPreferenceContext = createContext<UsersViewPreferenceContextType | undefined>(undefined)

export function UsersViewPreferenceProvider({ children }: { children: ReactNode }) {
  const [viewType, setViewType] = useState<UserViewType>(() => {
    return (sessionStorage.getItem('usersViewType') as UserViewType) || 'original'
  })

  const handleSetViewType = (type: UserViewType) => {
    setViewType(type)
    sessionStorage.setItem('usersViewType', type)
  }

  return (
    <UsersViewPreferenceContext.Provider value={{ viewType, setViewType: handleSetViewType }}>
      {children}
    </UsersViewPreferenceContext.Provider>
  )
}

export function useUsersViewPreference() {
  const context = useContext(UsersViewPreferenceContext)
  if (!context) {
    throw new Error('useUsersViewPreference debe usarse dentro de UsersViewPreferenceProvider')
  }
  return context
}
