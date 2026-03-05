import { Routes, Route, NavLink } from 'react-router-dom'
import MeseroPage from './pages/MeseroPage'
import CocinaPage from './pages/CocinaPage'
import DashboardPage from './pages/DashboardPage'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
  }`

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <span className="text-brand-500 font-bold text-lg mr-4">RestaurApp</span>
        <NavLink to="/" className={navClass}>
          Mesas
        </NavLink>
        <NavLink to="/cocina" className={navClass}>
          Cocina
        </NavLink>
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>
      </nav>

      <main className="flex-1 p-4 md:p-6">
        <Routes>
          <Route path="/" element={<MeseroPage />} />
          <Route path="/cocina" element={<CocinaPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  )
}
