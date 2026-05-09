import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, UserPlus, Filter, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Pacientes() {
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome, 
          objetivo_texto,
          consultas (data_consulta)
        `)
        .order('nome')

      if (error) throw error

      // Process patients to get last consultation date
      const processed = data.map(p => {
        const lastConsult = p.consultas?.length > 0 
          ? [...p.consultas].sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))[0].data_consulta 
          : null
        
        return {
          ...p,
          lastConsultation: lastConsult
        }
      })

      setPatients(processed)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'Nenhuma'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Pacientes</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Gerencie e acompanhe a evolução dos seus pacientes.</p>
          </div>
          <button onClick={() => navigate('/pacientes/novo')} className="btn btn-primary" style={{ width: 'auto' }}>
            <UserPlus size={20} />
            Novo Paciente
          </button>
        </header>

        <div className="search-bar">
          <div className="search-input">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Buscar paciente por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn" style={{ width: 'auto', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Carregando pacientes...</div>
        ) : (
          <div className="table-card">
            {filteredPatients.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? 'Nenhum paciente encontrado para essa busca.' : 'Nenhum paciente cadastrado ainda.'}
              </div>
            ) : (
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Objetivo Principal</th>
                    <th>Última Consulta</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient.id} onClick={() => navigate(`/pacientes/${patient.id}`)}>
                      <td style={{ fontWeight: 600 }}>{patient.nome}</td>
                      <td>{patient.objetivo_texto || 'Não informado'}</td>
                      <td>{formatDate(patient.lastConsultation)}</td>
                      <td><ChevronRight size={18} color="var(--text-secondary)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
