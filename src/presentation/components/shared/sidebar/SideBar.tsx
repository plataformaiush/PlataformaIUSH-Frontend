import { useHiddenNavStore } from "./store/hiddenNavStore"
import SidebarFooter from "./modules/SidebarFooter"
import SidebarHeader from "./modules/SidebarHeader"
import SidebarNavigation from "./modules/SidebarNavigation"

import { SidebarProps } from "./types/Sidebar.types"

const Sidebar = ({ showToggle = true }: SidebarProps) => {
  const hiddenNav = useHiddenNavStore((state) => state.hiddenNav)

  return (
    <div className={`flex h-full min-h-full w-full flex-col p-0 m-0 transition-all duration-300 ${hiddenNav ? 'items-center' : ''}`} style={{backgroundColor:"var(--color-primary)"}}>
     
      <section >
        <SidebarHeader showToggle={showToggle}/>
      </section>

      <section className='flex-1'>
        <SidebarNavigation/>
      </section>

      <section className='mt-auto'>
        <SidebarFooter/>
      </section>

    </div>
  )
}

export default Sidebar
