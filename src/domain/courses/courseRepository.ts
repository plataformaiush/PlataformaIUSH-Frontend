import { Course } from './types'

export class CourseRepository {
  static getAllCourses(): Course[] {
    return [
      {
        id: 'course-1',
        title: 'React Fundamentals',
        description: 'Learn the basics of React and build reusable UI components.',
        instructor: 'Ana López',
        level: 'beginner',
        status: 'active',
        moduleIds: ['module-1', 'module-2'],
        studentCount: 42
      },
      {
        id: 'course-2',
        title: 'Advanced TypeScript',
        description: 'Deep dive into TypeScript types, generics and architecture.',
        instructor: 'Carlos Méndez',
        level: 'intermediate',
        status: 'inactive',
        moduleIds: ['module-3', 'module-4'],
        studentCount: 18
      }
    ]
  }

  static getCourseById(courseId: string): Course | undefined {
    return this.getAllCourses().find((course) => course.id === courseId)
  }
}