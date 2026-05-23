import { type Role, Section} from "../types/Sidebar.types"

import DashboardIcon from "@mui/icons-material/Dashboard"
import SchoolIcon from "@mui/icons-material/School"
import DescriptionIcon from "@mui/icons-material/Description"
import PeopleIcon from "@mui/icons-material/People"
import SettingsIcon from "@mui/icons-material/Settings"

const selectSectionByRole: Record<Role, Section[]> = {
    SuperAdmin: [
        { path: "/super-admin/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
        { path: "/super-admin/usuarios", label: "Usuarios", icon: <PeopleIcon /> },
        { path: "/super-admin/cursos", label: "Cursos", icon: <SchoolIcon /> },
        { path: "/super-admin/resumen", label: "Resumen", icon: <DescriptionIcon /> },
        { path: "/super-admin/personalizacion", label: "Personalización", icon: <SettingsIcon /> },
    ],

    Admin: [
        { path: "/super-admin/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
        { path: "/super-admin/usuarios", label: "Usuarios", icon: <PeopleIcon /> },
        { path: "/super-admin/cursos", label: "Cursos", icon: <SchoolIcon /> },
        { path: "/super-admin/resumen", label: "Resumen", icon: <DescriptionIcon /> },
    ],

    Docente: [
        { path: "/teacher/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
        { path: "/courses", label: "Cursos", icon: <SchoolIcon /> },
    ],

    Estudiante: [], //No tiene sidebar
}

export const definedSectionRole = (): Section[] => {
    try {
        const {roles} = JSON.parse(localStorage.getItem("user") ?? "{}")
        const role = roles?.[0] as Role | undefined

        return role ? selectSectionByRole[role] ?? [] : []
    } catch {
        return []
    }
}