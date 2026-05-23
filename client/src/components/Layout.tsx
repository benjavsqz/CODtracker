import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PwaInstallBanner from './PwaInstallBanner'


const topLink = ({ isActive }: { isActive: boolean }) =>
  `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'text-white bg-white/[0.08] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-red-400/70'
      : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.05]'
  }`

const bottomLink = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-all ${
    isActive ? 'text-red-400' : 'text-gray-600 hover:text-gray-400'
  }`

const MetaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h12M3 17h8" />
  </svg>
)
const PerksIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)
const LoadoutsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
)
const BuilderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/meta') }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Decorative background logo — centered, fills screen */}
      <div
        className="fixed inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center"
        style={{ opacity: 0.08, zIndex: -1 }}
      >
        <img src="/favicon.svg" alt="" style={{ width: '100vmax', height: '100vmax', objectFit: 'contain' }} />
      </div>
      {/* Top header — visible on md+ */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img src="/logo-text.svg" alt="META WZ" className="h-5 sm:h-6 object-contain" />
            {/* Desktop nav */}
            <nav className="hidden sm:flex gap-1">
              <NavLink to="/meta" className={topLink}>Meta</NavLink>
              <NavLink to="/perks" className={topLink}>Ventajas</NavLink>
              <NavLink to="/builder" className={topLink}>Builder</NavLink>
              {isAuthenticated && <NavLink to="/loadouts" className={topLink}>Mis Loadouts</NavLink>}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-xs text-gray-500 px-2">{user?.username}</span>
                <button onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-gray-500 border border-white/[0.08] rounded-lg hover:text-white hover:border-white/20 transition-all">
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login"
                  className="hidden sm:block px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                  Iniciar sesión
                </NavLink>
                <NavLink to="/register"
                  className="px-3 py-1.5 text-xs bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/25 transition-all">
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full pb-24 sm:pb-6">
        <Outlet />
      </main>

      <PwaInstallBanner />

      {/* Bottom nav — mobile only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-t border-white/[0.07]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around py-1">
          <NavLink to="/meta" className={bottomLink}>
            <MetaIcon />
            <span>Meta</span>
          </NavLink>
          <NavLink to="/perks" className={bottomLink}>
            <PerksIcon />
            <span>Ventajas</span>
          </NavLink>
          <NavLink to="/builder" className={bottomLink}>
            <BuilderIcon />
            <span>Builder</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/loadouts" className={bottomLink}>
              <LoadoutsIcon />
              <span>Loadouts</span>
            </NavLink>
          )}
          {!isAuthenticated && (
            <NavLink to="/register" className={bottomLink}>
              <LoadoutsIcon />
              <span>Registro</span>
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  )
}
