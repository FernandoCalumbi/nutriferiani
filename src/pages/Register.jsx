import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UserPlus, Leaf } from 'lucide-react'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      // 1. Sign up user in Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      const user = data.user
      if (user) {
        // 2. Save nutritionist data in the public table
        const { error: profileError } = await supabase
          .from('nutricionistas')
          .insert([
            { 
              id: user.id, // Using auth.uid() as specified in the schema
              nome: fullName, 
              email: email 
            }
          ])

        if (profileError) throw profileError
      }

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
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
          <h1>Crie sua conta</h1>
          <p>Comece a organizar suas consultas hoje mesmo.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName">Nome Completo</label>
            <div className="input-wrapper">
              <input
                id="fullName"
                type="text"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : (
              <>
                <UserPlus size={20} />
                Criar conta
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta? <Link to="/login">Faça login</Link>
        </div>
      </div>
    </div>
  )
}
