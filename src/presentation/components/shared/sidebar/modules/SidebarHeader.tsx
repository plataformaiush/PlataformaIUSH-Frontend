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
    <div className={`flex gap-1.5 w-full p-2 ${
        hiddenNav ? 'justify-center' : 'justify-between'
      }`}
    >
      {!hiddenNav && (
        <div className="flex-1 flex justify-center">
          <img src={logoSrc} alt="Logo Institucional" className="w-30 h-30 object-fill"/>
        </div>
      )}

      {showToggle && (
        <MenuOpenIcon
          onClick={toggleHiddenNav}
          sx={{ fontSize: 30 }}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-on-dark)' }}
        />
      )}
    </div>
  )
}

export default SidebarHeader