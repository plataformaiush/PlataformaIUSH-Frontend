import { createElement } from 'react'
import { RouteObject } from 'react-router-dom'
import { CourseListPage } from '../../presentation/features/courses/CourseListPage'
import { CreateCoursePage } from '../../presentation/features/courses/CreateCoursePage'
import { ModuleListPage } from '../../presentation/features/courses/ModuleListPage'
import { CreateModulePage } from '../../presentation/features/courses/CreateModulePage'
import { ContentListPage } from '../../presentation/features/courses/ContentListPage'
import { AddContentPage } from '../../presentation/features/courses/AddContentPage'

export const coursesRoutes: RouteObject[] = [
  {
    path: '/courses',
    element: createElement(CourseListPage),
  },
  {
    path: '/courses/new',
    element: createElement(CreateCoursePage),
  },
  {
    path: '/courses/:courseId',
    element: createElement(ModuleListPage),
  },
  {
    path: '/courses/:courseId/modules/new',
    element: createElement(CreateModulePage),
  },
  {
    path: '/courses/:courseId/modules/:moduleId',
    element: createElement(ContentListPage),
  },
  {
    path: '/courses/:courseId/modules/:moduleId/contents/new',
    element: createElement(AddContentPage),
  },
]
