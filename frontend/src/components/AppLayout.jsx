import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  CalendarDays,
  CreditCard,
  House,
  LogOut,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  UserRound
} from 'lucide-react';
import logoTempel from '../assets/LogoTempelTraining.png';
import { useAuth } from '../context/AuthContext';

const menuByRole = {
  administrador: [
    { label: 'Usuarios', to: '/usuarios', icon: Users },
    { label: 'Socios', to: '/socios', icon: Users },
    { label: 'Membresías', to: '/membresias', icon: CreditCard },
    { label: 'Tienda', to: '/tienda', icon: ShoppingCart },
    { label: 'Ventas', to: '/ventas', icon: ReceiptText },
    { label: 'Reservas', to: '/reservas', icon: CalendarDays },
    { label: 'Reportes', to: '/reportes', icon: Activity },
    { label: 'Método', to: '/metodo', icon: Sparkles }
  ],
  recepcionista: [
    { label: 'Socios', to: '/socios', icon: Users },
    { label: 'Membresías', to: '/membresias', icon: CreditCard },
    { label: 'Tienda', to: '/tienda', icon: ShoppingCart },
    { label: 'Ventas', to: '/ventas', icon: ReceiptText },
    { label: 'Visitantes', to: '/visitantes', icon: UserRound },
    { label: 'Método', to: '/metodo', icon: Sparkles }
  ],
  entrenador: [
    { label: 'Mis Reservas', to: '/reservas', icon: CalendarDays },
    { label: 'Mis Socios', to: '/socios', icon: Users },
    { label: 'Método', to: '/metodo', icon: Sparkles }
  ],
  cliente: [
    { label: 'Mi Perfil', to: '/socios/1', icon: House },
    { label: 'Mi Membresía', to: '/membresias', icon: CreditCard },
    { label: 'Tienda', to: '/tienda', icon: ShoppingCart },
    { label: 'Reservar Entrenamiento', to: '/reservas', icon: CalendarDays },
    { label: 'Método', to: '/metodo', icon: Sparkles }
  ]
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = menuByRole[user?.rol || 'administrador'] || menuByRole.administrador;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-tempel-bg text-tempel-text">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-tempel-border bg-[#0B0D10] p-5">
          <div className="mb-10 flex items-center gap-3">
            <img
              src={logoTempel}
              alt="Tempel Training"
              className="h-14 w-14 rounded-xl object-cover shadow-[0_0_18px_rgba(41,182,246,0.22)]"
            />
            <div>
              <p className="text-lg font-semibold tracking-tight">Tempel</p>
              <p className="text-xs uppercase tracking-[0.28em] text-tempel-muted">Training</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-tempel-card text-tempel-text shadow-[0_0_0_1px_rgba(41,182,246,0.25)]' : 'text-tempel-muted hover:bg-tempel-card/60 hover:text-tempel-text'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-xl border border-tempel-border bg-tempel-card/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-tempel-blue">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">Estado</span>
            </div>
            <p className="text-sm text-tempel-muted">Sistema operativo</p>
            <p className="mt-1 text-base font-semibold">Gestión activa</p>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-tempel-border bg-tempel-bg/80 px-7 py-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-tempel-border bg-tempel-card/60 px-3 py-2.5 text-tempel-muted">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent text-sm text-tempel-text placeholder:text-tempel-muted focus:outline-none"
                  placeholder="Buscar socios, productos, ventas..."
                />
              </div>

              <div className="flex items-center gap-4">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-tempel-border bg-tempel-card text-tempel-text">
                  <Bell className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 rounded-xl border border-tempel-border bg-tempel-card px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tempel-blue/15 font-semibold text-tempel-blue">
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-tempel-text">{user?.nombre || 'Tempel'}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-tempel-muted">{user?.rol || 'usuario'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-tempel-muted transition hover:text-tempel-text"
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
