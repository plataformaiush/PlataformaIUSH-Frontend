import { HelpCircle, LogOut } from 'lucide-react'
import { useHiddenNavStore } from '../store/hiddenNavStore'
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/auth.store'

const SidebarFooter = () => {
  
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout)

  const MOCK_STUDENT = {avatar: 'https://api.dicebear.com/9.x/icons/svg?seed=Jessica',}
  const hiddenNav = useHiddenNavStore((state) => state.hiddenNav)

  const getUserStorage = JSON.parse(localStorage.getItem('user') ?? 'null') ?? {};
  const {roles, nombre} = getUserStorage as { roles?: string[]; nombre?: string }

  const handleClose = () => {
    logout()
    navigate("/login")
  }

  return (
    <div>
      <div className="shrink-0 px-3 pb-4 space-y-2 pt-4" style={{ borderTopColor: 'rgba(255, 255, 255, 0.1)', borderTopWidth: '1px' }}>

        <Tooltip describeChild title="Ayuda" arrow placement="right" disableHoverListener={!hiddenNav}>
            <button aria-label="Ayuda"
              className={`flex items-center ${hiddenNav ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium transition-all w-full ${hiddenNav ? '' : 'text-left hover:bg-white/10'}`}
              style={{ color: 'var(--color-text-on-dark)' }}
            >
              <HelpCircle size={18}/>
              {!hiddenNav && <span>Ayuda</span>}
            </button>
        </Tooltip>


        <Tooltip describeChild title="Cerrar Sesión" arrow placement="right" disableHoverListener={!hiddenNav}>
          <button aria-label="Cerrar sesión"
            className={`flex items-center ${hiddenNav ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium cursor-pointer w-full ${hiddenNav ? '' : 'text-left hover:bg-red-500/20'} transition-all`}
            style={{ color: 'var(--color-text-on-dark)' }}
            onClick={() => handleClose()}
          >
            <LogOut size={18} />
            {!hiddenNav && <span>Cerrar sesión</span>}
          </button>
        </Tooltip>


        <div aria-label={nombre} className={`flex items-center px-3 py-3 mt-2 rounded-xl cursor-pointer transition-all hover:opacity-90 ${hiddenNav ? 'justify-center' : 'gap-3'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
          <img src={MOCK_STUDENT.avatar} alt={nombre} className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{
              borderColor: 'var(--color-tertiary)',
              borderWidth: '2px'
            }}
          />
          {!hiddenNav && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-on-dark)' }}>{nombre}</p>
              <p className="text-xs opacity-80" style={{ color: 'var(--color-text-on-dark)' }}>{roles?.[0]}</p>
            </div>
          )}
        </div>
        </div>
    </div>
  )
}

export default SidebarFooter
