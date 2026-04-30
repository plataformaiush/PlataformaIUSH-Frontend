import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '../presentation/pages/HomePage'
import { SuperAdminPage } from '../presentation/features/institutions/SuperAdminPage'
import { InstitutionProvider } from '../context/InstitutionContext'

export function AppRouter() {
  return (
    <InstitutionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/super-admin" element={<SuperAdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </InstitutionProvider>
  )
}