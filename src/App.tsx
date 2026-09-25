import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { LoadingState } from './components/ui/States'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ClientsPage = lazy(() => import('./pages/ClientsPage').then((module) => ({ default: module.ClientsPage })))
const ClientDetailPage = lazy(() => import('./pages/ClientDetailPage').then((module) => ({ default: module.ClientDetailPage })))
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((module) => ({ default: module.SubmissionsPage })))
const SubmissionDetailPage = lazy(() => import('./pages/SubmissionDetailPage').then((module) => ({ default: module.SubmissionDetailPage })))
const PlansPage = lazy(() => import('./pages/PlansPage').then((module) => ({ default: module.PlansPage })))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage').then((module) => ({ default: module.DocumentsPage })))
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage').then((module) => ({ default: module.SubscriptionsPage })))

export default function App() {
  return (
    <Suspense fallback={<div className="p-6"><LoadingState /></div>}><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:clientId" element={<ClientDetailPage />} />
          <Route path="submissions" element={<SubmissionsPage />} />
          <Route path="submissions/:submissionId" element={<SubmissionDetailPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="payments" element={<Navigate to="/plans" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  )
}
