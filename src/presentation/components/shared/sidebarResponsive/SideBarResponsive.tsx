import Sidebar from '../sidebar/SideBar'

interface SideBarResponsiveProps{
  isOpen: boolean
  onClose: () => void
}

const SideBarResponsive = ({ isOpen, onClose }: SideBarResponsiveProps) => {
  return (
    <>
      <div className={`fixed inset-x-0 top-[70px] bottom-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`fixed inset-x-0 top-[70px] bottom-0 z-40 w-[82vw] max-w-[290px] overflow-hidden bg-[var(--color-primary)] shadow-2xl transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar showToggle={false}/>
      </aside>
    </>
  )
}

export default SideBarResponsive
