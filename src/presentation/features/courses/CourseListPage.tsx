import { CourseRepository } from '../../../domain/courses/courseRepository'
import { CourseCard } from './CourseCard'
import { Link } from 'react-router-dom'
import { Course } from '../../../domain/courses/types'

export const CourseListPage = () => {
  const courses = CourseRepository.getAllCourses()
  const activeCourses = courses.filter((c) => c.status === 'active')
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top header bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <nav className="mb-1 flex items-center gap-1 text-xs text-gray-400">
              <span>EduPlatform</span>
              <span>›</span>
              <span>Cursos</span>
              <span>›</span>
              <span style={{ color: '#5A878C' }} className="font-medium">Gestión</span>
            </nav>
            <h1 className="text-2xl font-bold" style={{ color: '#223740' }}>
              Gestión de Cursos
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: '#5A878C' }}>
              Administra cursos, módulos y contenidos
            </p>
          </div>
          <Link
            to="/courses/new"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#223740' }}
          >
            + Crear curso ↗
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats cards */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Total Cursos
            </p>
            <p className="mt-2 text-4xl font-bold" style={{ color: '#223740' }}>{courses.length}</p>
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              ↑ 3 este mes
            </span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Estudiantes Activos
            </p>
            <p className="mt-2 text-4xl font-bold" style={{ color: '#223740' }}>{totalStudents}</p>
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              ↑ 18 nuevos
            </span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Cursos Activos
            </p>
            <p className="mt-2 text-4xl font-bold" style={{ color: '#223740' }}>{activeCourses.length}</p>
            <div className="mt-3 h-1 rounded-full bg-gray-100">
              <div
                className="h-1 rounded-full"
                style={{
                  backgroundColor: '#5A878C',
                  width: `${courses.length ? (activeCourses.length / courses.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter tabs + count */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {['Todos', 'Activos', 'Inactivos'].map((tab) => (
              <button
                key={tab}
                className="rounded-md px-4 py-1.5 text-sm font-medium transition"
                style={
                  tab === 'Todos'
                    ? { backgroundColor: '#223740', color: 'white' }
                    : { color: '#5A878C' }
                }
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-sm" style={{ color: '#5A878C' }}>
            {courses.length} cursos encontrados
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Curso
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Módulos
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Estudiantes
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Estado
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#5A878C' }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <CourseCard key={course.id} course={course} isLast={idx === courses.length - 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}