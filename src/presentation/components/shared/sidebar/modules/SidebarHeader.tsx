import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import logoDefault from '../../img/ProfunSoft.png'
import { useHiddenNavStore } from "../store/hiddenNavStore"
import { useInstitution } from '../../../../../context/InstitutionContext'

import { SidebarProps } from '../types/Sidebar.types'

const SidebarHeader = ({ showToggle = true }: SidebarProps) => {

  const { hiddenNav, toggleHiddenNav } = useHiddenNavStore()
  const { logo } = useInstitution()
  const logoSrc = logo || logoDefault

  return (
    <div className={`flex items-center w-full p-4 ${
        hiddenNav ? 'justify-center' : 'justify-between'
      }`}
    >
      {!hiddenNav && (
        <div className="flex-1 flex justify-center">
          <img src={logoSrc} alt="Logo Institucional" className="h-10 w-auto object-contain"/>
        </div>
      )}

      {showToggle && (
        <button
          onClick={toggleHiddenNav}
          className="p-2 rounded-xl transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-on-dark)' }}
          aria-label={hiddenNav ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          <MenuOpenIcon sx={{ fontSize: 24 }} className={`${hiddenNav ? 'rotate-180' : ''} transition-transform duration-300`} />
        </button>
      )}
    </div>
  )
}

export default SidebarHeader