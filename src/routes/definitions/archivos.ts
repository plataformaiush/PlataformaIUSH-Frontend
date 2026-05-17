import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import PagePrueba from '../../presentation/features/files/app/pagePrueba'

export const archivosRoutes: RouteObject[] = [
  {
    path: '/archivos',
    element: createElement(PagePrueba),
  },
]