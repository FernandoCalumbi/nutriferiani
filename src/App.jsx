import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import NovoPaciente from './pages/NovoPaciente'
import PerfilPaciente from './pages/PerfilPaciente'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/pacientes/novo" element={<NovoPaciente />} />
        <Route path="/pacientes/:id" element={<PerfilPaciente />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
