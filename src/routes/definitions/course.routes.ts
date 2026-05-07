import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { CourseListPage } from '../../presentation/features/courses/CourseListPage'
import { ModuleListPage } from '../../presentation/features/courses/ModuleListPage'
import { ContentListPage } from '../../presentation/features/courses/ContentListPage'
import { CreateCoursePage } from '../../presentation/features/courses/CreateCoursePage'
import { CreateModulePage } from '../../presentation/features/courses/CreateModulePage'
import { AddContentPage } from '../../presentation/features/courses/AddContentPage'
import { SuperAdminPage } from '../../presentation/features/institutions/SuperAdminPage'

export const courseRoutes: RouteObject[] = [
  {
    path: '/super-admin',
    element: createElement(SuperAdminPage)
  },
  {
    path: '/courses',
    element: createElement(CourseListPage)
  },
  {
    path: '/courses/new',
    element: createElement(CreateCoursePage)
  },
  {
    path: '/courses/:courseId/modules',
    element: createElement(ModuleListPage)
  },
  {
    path: '/courses/:courseId/modules/new',
    element: createElement(CreateModulePage)
  },
  {
    path: '/courses/:courseId/modules/:moduleId/contents',
    element: createElement(ContentListPage)
  },
  {
    path: '/courses/:courseId/modules/:moduleId/contents/new',
    element: createElement(AddContentPage)
  }
]