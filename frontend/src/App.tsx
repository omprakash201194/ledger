import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'
import DashboardPage from './pages/DashboardPage'
import AssetsPage from './pages/AssetsPage'
import LiabilitiesPage from './pages/LiabilitiesPage'
import InsurancePage from './pages/InsurancePage'
import RecurringPage from './pages/RecurringPage'
import TrustedPersonsPage from './pages/TrustedPersonsPage'
import DigitalAccountsPage from './pages/DigitalAccountsPage'
import WillPage from './pages/WillPage'
import AlertsPage from './pages/AlertsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="liabilities" element={<LiabilitiesPage />} />
          <Route path="insurance" element={<InsurancePage />} />
          <Route path="recurring" element={<RecurringPage />} />
          <Route path="trusted-persons" element={<TrustedPersonsPage />} />
          <Route path="digital-accounts" element={<DigitalAccountsPage />} />
          <Route path="will" element={<WillPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
