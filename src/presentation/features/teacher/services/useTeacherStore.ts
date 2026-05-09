import { create } from "zustand";
import {
  gradeAssignments,
  gradesMock,
  teacherCourses,
  teacherStudents,
} from "../../../../domain/teacher/teacherMock";
import { GradeRow, TeacherCourse, TeacherStudent } from "../../../../domain/teacher/teacherTypes";

interface TeacherStore {
  courses: TeacherCourse[];
  students: TeacherStudent[];
  grades: GradeRow[];
  selectedCourseId: string;
  studentSearch: string;
  lastSavedAt: string | null;
  setSelectedCourseId: (courseId: string) => void;
  setStudentSearch: (value: string) => void;
  updateGrade: (rowId: string, assignmentKey: string, value: number | null) => void;
  saveGrades: () => void;
  getGradeAverage: (row: GradeRow) => number;
}

export const useTeacherStore = create<TeacherStore>((set) => ({
  courses: teacherCourses,
  students: teacherStudents,
  grades: gradesMock,
  selectedCourseId: "frontend",
  studentSearch: "",
  lastSavedAt: null,

  setSelectedCourseId: (courseId) => {
    set({ selectedCourseId: courseId });
  },

  setStudentSearch: (value) => {
    set({ studentSearch: value });
  },

  updateGrade: (rowId, assignmentKey, value) => {
    set((state) => ({
      grades: state.grades.map((row) =>
        row.id === rowId
          ? {
              ...row,
              assignments: {
                ...row.assignments,
                [assignmentKey]: value,
              },
            }
          : row
      ),
    }));
  },

  saveGrades: () => {
    const now = new Date();
    set({
      lastSavedAt: now.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  },

  getGradeAverage: (row) => {
    const totalWeight = gradeAssignments.reduce((total, assignment) => {
      const grade = row.assignments[assignment.key];

      if (grade === null || grade === undefined) {
        return total;
      }

      return total + assignment.percentage;
    }, 0);

    if (totalWeight === 0) {
      return 0;
    }

    const weightedValue = gradeAssignments.reduce((total, assignment) => {
      const grade = row.assignments[assignment.key];

      if (grade === null || grade === undefined) {
        return total;
      }

      return total + grade * assignment.percentage;
    }, 0);

    return Number((weightedValue / totalWeight).toFixed(1));
  },
}));