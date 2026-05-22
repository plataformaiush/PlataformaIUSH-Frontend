export type Role = "Admin" | "SuperAdmin" | "Estudiante" | "Docente" //Roles dentro de la Aplicación

export interface Section { //Interfaz para los elementos de cada sección
  path: string
  label: string
  icon: React.ReactNode
}

export interface SidebarProps { //Interfaz para cambiar la visiblidad del sidebar.
  showToggle?: boolean
}
