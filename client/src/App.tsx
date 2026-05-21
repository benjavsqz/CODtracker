import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Loadouts from './pages/Loadouts'
import Login from './pages/Login'
import Register from './pages/Register'
import Share from './pages/Share'
import Perks from './pages/Perks'
import LoadoutBuilder from './pages/LoadoutBuilder'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/share/:slug" element={<Share />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/meta" replace />} />
          <Route path="meta" element={<Dashboard />} />
          <Route path="perks" element={<Perks />} />
          <Route path="builder" element={<LoadoutBuilder />} />
          <Route path="loadouts" element={<Loadouts />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
