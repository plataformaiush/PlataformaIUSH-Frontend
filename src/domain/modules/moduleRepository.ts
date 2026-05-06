import { Module } from './types'

export class ModuleRepository {
  static getAllModules(): Module[] {
    return [
      {
        id: 'module-1',
        courseId: 'course-1',
        title: 'React Components',
        description: 'Understand functional components and props.',
        order: 1,
        status: 'active',
        contentIds: ['content-1', 'content-2']
      },
      {
        id: 'module-2',
        courseId: 'course-1',
        title: 'React State and Events',
        description: 'Manage state and handle user actions.',
        order: 2,
        status: 'active',
        contentIds: ['content-3', 'content-4']
      },
      {
        id: 'module-3',
        courseId: 'course-2',
        title: 'TypeScript Types',
        description: 'Learn advanced type patterns and type inference.',
        order: 1,
        status: 'active',
        contentIds: ['content-5', 'content-6']
      },
      {
        id: 'module-4',
        courseId: 'course-2',
        title: 'Generics in TypeScript',
        description: 'Build reusable functions and components with generics.',
        order: 2,
        status: 'inactive',
        contentIds: ['content-7', 'content-8']
      }
    ]
  }

  static getModulesByCourse(courseId: string): Module[] {
    return this.getAllModules().filter((module) => module.courseId === courseId)
  }

  static getModuleById(moduleId: string): Module | undefined {
    return this.getAllModules().find((module) => module.id === moduleId)
  }
}