import { useEffect } from 'react'
import { useAuthStore } from '../../../stores/auth.store'
import { trackRolMasUsado } from '../events/TagManagerEvents'
import { Role } from '../../../components/shared/sidebar/types/Sidebar.types'

export const useHandleRolTracker = () => {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user?.roles?.length) {
      return
    }

    const currentRole = (user.roles[0] ?? 'Sin rol') as Role | 'Sin rol'

    const interval = setInterval(() => {
      trackRolMasUsado(currentRole)
    }, 300000)

    return () => clearInterval(interval)
  }, [user?.roles])
}