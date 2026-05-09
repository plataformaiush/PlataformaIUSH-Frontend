import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TeacherDashboard from "../presentation/features/teacher/TeacherDashboard";
import CoursesView from "../presentation/features/teacher/CoursesView";
import GradesTable from "../presentation/features/teacher/components/GradesTable";
import StudentsList from "../presentation/features/teacher/components/StudentsList";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />

        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<CoursesView />} />
        <Route path="/teacher/grades" element={<GradesTable />} />
        <Route path="/teacher/students" element={<StudentsList />} />

        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};