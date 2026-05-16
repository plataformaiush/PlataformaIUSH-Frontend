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

  static createCourse(course: Omit<Course, 'id'>): Course {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`
    }
    return newCourse
  }

  static updateCourse(courseId: string, updates: Partial<Course>): Course | null {
    const courses = this.getAllCourses()
    const index = courses.findIndex((c) => c.id === courseId)
    if (index !== -1) {
      const updatedCourse = { ...courses[index], ...updates }
      return updatedCourse
    }
    return null
  }

  static deleteCourse(courseId: string): boolean {
    const courses = this.getAllCourses()
    const index = courses.findIndex((c) => c.id === courseId)
    if (index !== -1) {
      courses.splice(index, 1)
      return true
    }
    return false
  }
}