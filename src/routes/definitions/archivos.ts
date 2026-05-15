import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { VistasArchivos } from '../../presentation/features/files/components/vistas/vistasArchivos'

export const archivosRoutes: RouteObject[] = [
  {
    path: '/archivos',
    element: createElement(VistasArchivos),
  },
]