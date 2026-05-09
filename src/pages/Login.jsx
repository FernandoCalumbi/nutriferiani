import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogIn, Leaf } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/dashboard')
      }
    }
    checkUser()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      navigate('/dashboard')
    } catch (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email ou senha inválidos.' 
        : error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="logo">
          <Leaf size={32} fill="var(--primary-color)" />
          Nutri<span>System</span>
        </Link>
        
        <div className="auth-header">
          <h1>Bem-vinda de volta</h1>
          <p>Acesse sua conta para gerenciar seus pacientes.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : (
              <>
                <LogIn size={20} />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </div>
      </div>
    </div>
  )
}
