import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    weekConsultations: 0,
    patientsWithoutReturn: []
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        
        // 1. Total Patients
        const { count: patientCount } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })

        // 2. Consultations of the week
        const today = new Date()
        const firstDayOfWeek = new Date(today)
        firstDayOfWeek.setDate(today.getDate() - today.getDay())
        firstDayOfWeek.setHours(0, 0, 0, 0)

        const { count: consultationCount } = await supabase
          .from('consultas')
          .select('id, paciente_id, pacientes!inner(nutricionista_id)', { count: 'exact', head: true })
          .gte('data_consulta', firstDayOfWeek.toISOString())

        // 3. Patients without return
        // Fetch patients and their related consultas
        // We look for patients where the latest consultation was > 30 days ago 
        // AND no future proximo_retorno exists
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)
        
        const { data: patientsData } = await supabase
          .from('pacientes')
          .select(`
            id, 
            nome, 
            consultas (
              data_consulta, 
              proximo_retorno
            )
          `)

        const withoutReturn = patientsData?.filter(patient => {
          const consultas = patient.consultas || []
          if (consultas.length === 0) return false // Or maybe true if they were never consulted? Prompt says "última consulta foi há mais de 30 dias"

          // Get the most recent consultation
          const sortedConsultas = [...consultas].sort((a, b) => 
            new Date(b.data_consulta) - new Date(a.data_consulta)
          )
          
          const lastConsultation = new Date(sortedConsultas[0].data_consulta)
          const hasFutureReturn = consultas.some(c => 
            c.proximo_retorno && new Date(c.proximo_retorno) >= today
          )

          return lastConsultation < thirtyDaysAgo && !hasFutureReturn
        }) || []

        setStats({
          totalPatients: patientCount || 0,
          weekConsultations: consultationCount || 0,
          patientsWithoutReturn: withoutReturn
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Painel Geral</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bem-vinda ao NutriSystem. Veja o resumo da sua clínica.</p>
        </header>

        {loading ? (
          <div className="empty-state">Carregando dados...</div>
        ) : (
          <>
            <div className="dashboard-grid">
              {/* Card 1: Total Patients */}
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>Total de Pacientes</h3>
                  <Users size={20} color="var(--primary-color)" />
                </div>
                <div className="stat-value">{stats.totalPatients}</div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <TrendingUp size={16} color="var(--success-color)" />
                  <span>Pacientes ativos</span>
                </div>
              </div>

              {/* Card 2: Week Consultations */}
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>Consultas da Semana</h3>
                  <Calendar size={20} color="var(--primary-color)" />
                </div>
                <div className="stat-value">{stats.weekConsultations}</div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>Agendadas para esta semana</span>
                </div>
              </div>

              {/* Card 3 Summary: Alert count if many without return */}
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>Atenção Necessária</h3>
                  <AlertCircle size={20} color={stats.patientsWithoutReturn.length > 0 ? "#ef4444" : "var(--primary-color)"} />
                </div>
                <div className="stat-value" style={{ color: stats.patientsWithoutReturn.length > 0 ? "#ef4444" : "var(--primary-color)" }}>
                  {stats.patientsWithoutReturn.length}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>Pacientes sem retorno</span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
              {/* List of Patients without return */}
              <div className="patients-list-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={24} color="#ef4444" />
                  <h3 style={{ margin: 0 }}>Pacientes Sem Retorno (+30 dias)</h3>
                </div>

                {stats.patientsWithoutReturn.length === 0 ? (
                  <div className="empty-state">Nenhum paciente sem retorno no momento</div>
                ) : (
                  <ul className="patient-list">
                    {stats.patientsWithoutReturn.map(patient => (
                      <li key={patient.id} className="patient-list-item">
                        <Link to={`/pacientes/${patient.id}`} className="patient-link">
                          {patient.nome}
                        </Link>
                        <span className="badge badge-alert">Sem retorno agendado</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
