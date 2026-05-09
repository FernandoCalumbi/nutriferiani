import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Leaf, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Sidebar() {
  const location = useLocation()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="sidebar">
      <Link to="/dashboard" className="logo" style={{ justifyContent: 'flex-start', marginBottom: '3rem' }}>
        <Leaf size={32} fill="var(--primary-color)" />
        Nutri<span>System</span>
      </Link>

      <nav className="nav-menu">
        <Link 
          to="/dashboard" 
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link 
          to="/pacientes" 
          className={`nav-item ${location.pathname === '/pacientes' ? 'active' : ''}`}
        >
          <Users size={20} />
          Pacientes
        </Link>
      </nav>

      <button 
        onClick={handleLogout} 
        className="nav-item" 
        style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
      >
        <LogOut size={20} />
        Sair
      </button>
    </div>
  )
}
