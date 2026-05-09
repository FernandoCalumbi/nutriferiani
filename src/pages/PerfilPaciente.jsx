import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  ArrowLeft, Save, Plus, FileText, TrendingUp, 
  CheckCircle, Calendar, Info, Heart, Coffee, X
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'
import Sidebar from '../components/Sidebar'

export default function PerfilPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('pessoal')
  const [showModal, setShowModal] = useState(false)

  // Data State
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [plans, setPlans] = useState([])

  // Modal State
  const [newConsultation, setNewConsultation] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  })

  useEffect(() => {
    fetchPatientData()
  }, [id])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      
      // Fetch Patient
      const { data: patientData, error: pError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (pError) throw pError
      setPatient(patientData)

      // Fetch Consultations
      const { data: consultData, error: cError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false })
      
      if (cError) throw cError
      setConsultations(consultData)

      // Fetch Plans
      const { data: planData, error: plError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false })
      
      if (plError) throw plError
      setPlans(planData)

    } catch (error) {
      console.error('Error fetching profile data:', error)
      navigate('/pacientes')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePatient = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('pacientes')
        .update(patient)
        .eq('id', id)
      
      if (error) throw error
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      alert('Erro ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConsultation = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('consultas')
        .insert([{ ...newConsultation, paciente_id: id }])
      
      if (error) throw error
      
      setShowModal(false)
      setNewConsultation({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      })
      fetchPatientData()
    } catch (error) {
      alert('Erro ao salvar consulta.')
    }
  }

  const chartData = [...consultations]
    .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta))
    .map(c => ({
      name: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: parseFloat(c.peso)
    }))

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">Carregando perfil...</main>
    </div>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem' }}>
          <button onClick={() => navigate('/pacientes')} className="btn" style={{ width: 'auto', background: 'none', padding: 0, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <ArrowLeft size={20} /> Voltar para pacientes
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{patient.nome}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Acompanhamento clínico e nutricional</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ width: 'auto', background: 'white', border: '1px solid var(--border-color)' }}>
                <TrendingUp size={20} /> Ver Evolução
              </button>
              <button className="btn btn-primary" style={{ width: 'auto' }}>
                <FileText size={20} /> Gerar Plano Alimentar
              </button>
            </div>
          </div>
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={24} />
            Alterações salvas com sucesso!
          </div>
        )}

        {/* SEÇÃO 1: DADOS DO PACIENTE */}
        <section className="profile-section">
          <div className="section-header">
            <h2>Dados do Paciente</h2>
            <button onClick={handleUpdatePatient} className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
              {saving ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
            </button>
          </div>

          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('pessoal')}>
              <Info size={18} /> Pessoal
            </button>
            <button className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`} onClick={() => setActiveTab('clinico')}>
              <Heart size={18} /> Clínico
            </button>
            <button className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`} onClick={() => setActiveTab('habitos')}>
              <Coffee size={18} /> Hábitos
            </button>
          </div>

          <div className="form-grid">
            {activeTab === 'pessoal' && (
              <>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nome Completo</label>
                  <input className="input-wrapper" value={patient.nome} onChange={e => setPatient({...patient, nome: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="input-wrapper" value={patient.email || ''} onChange={e => setPatient({...patient, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input className="input-wrapper" value={patient.telefone || ''} onChange={e => setPatient({...patient, telefone: e.target.value})} />
                </div>
              </>
            )}
            {activeTab === 'clinico' && (
              <>
                <div className="form-group">
                  <label>Peso Inicial (kg)</label>
                  <input className="input-wrapper" type="number" value={patient.peso_inicial || ''} onChange={e => setPatient({...patient, peso_inicial: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Altura (cm)</label>
                  <input className="input-wrapper" type="number" value={patient.altura || ''} onChange={e => setPatient({...patient, altura: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Medicamentos</label>
                  <textarea className="input-wrapper" style={{ minHeight: '80px' }} value={patient.medicamentos || ''} onChange={e => setPatient({...patient, medicamentos: e.target.value})} />
                </div>
              </>
            )}
            {activeTab === 'habitos' && (
              <>
                <div className="form-group">
                  <label>Refeições/Dia</label>
                  <input className="input-wrapper" type="number" value={patient.refeicoes_por_dia || ''} onChange={e => setPatient({...patient, refeicoes_por_dia: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Litros de Água/Dia</label>
                  <input className="input-wrapper" type="number" value={patient.litros_agua || ''} onChange={e => setPatient({...patient, litros_agua: e.target.value})} />
                </div>
              </>
            )}
          </div>
        </section>

        {/* SEÇÃO 2: CONSULTAS */}
        <section className="profile-section">
          <div className="section-header">
            <h2>Consultas e Evolução</h2>
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ width: 'auto' }}>
              <Plus size={18} /> Nova Consulta
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Evolução de Peso (kg)</h3>
            <div className="chart-container">
              {consultations.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="peso" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-color)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Nenhuma consulta registrada ainda.</div>
              )}
            </div>
          </div>

          <div>
            {consultations.map(c => (
              <div key={c.id} className="consultation-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <Calendar size={18} color="var(--primary-color)" />
                    {new Date(c.data_consulta).toLocaleDateString('pt-BR')}
                  </div>
                  {c.proximo_retorno && (
                    <span className="badge" style={{ background: '#f0fdf4', color: 'var(--primary-color)' }}>
                      Retorno: {new Date(c.proximo_retorno).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <div className="grid-metrics">
                  <div className="metric-box">
                    <span className="metric-label">Peso</span>
                    <span className="metric-value">{c.peso} kg</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Cintura</span>
                    <span className="metric-value">{c.cintura || '-'} cm</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Quadril</span>
                    <span className="metric-value">{c.quadril || '-'} cm</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">% Gordura</span>
                    <span className="metric-value">{c.percentual_gordura || '-'} %</span>
                  </div>
                </div>
                {c.observacoes && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <strong>Obs:</strong> {c.observacoes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: PLANOS ALIMENTARES */}
        <section className="profile-section">
          <div className="section-header">
            <h2>Planos Alimentares</h2>
          </div>
          {plans.length === 0 ? (
            <div className="empty-state">Nenhum plano alimentar gerado ainda.</div>
          ) : (
            <div>
              {plans.map(p => (
                <div key={p.id} className="consultation-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FileText size={24} color="var(--primary-color)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Plano Alimentar</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gerado em: {new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <button className="btn" style={{ width: 'auto', background: 'none', color: 'var(--primary-color)' }}>Visualizar</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MODAL NOVA CONSULTA */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button onClick={() => setShowModal(false)} className="btn" style={{ position: 'absolute', top: '1rem', right: '1rem', width: 'auto', padding: '0.5rem', background: 'none' }}>
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '2rem' }}>Nova Consulta</h2>
              <form onSubmit={handleSaveConsultation}>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Data da Consulta</label>
                    <input type="date" className="input-wrapper" value={newConsultation.data_consulta} onChange={e => setNewConsultation({...newConsultation, data_consulta: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg)</label>
                    <input type="number" step="0.1" className="input-wrapper" value={newConsultation.peso} onChange={e => setNewConsultation({...newConsultation, peso: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Cintura (cm)</label>
                    <input type="number" step="0.1" className="input-wrapper" value={newConsultation.cintura} onChange={e => setNewConsultation({...newConsultation, cintura: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quadril (cm)</label>
                    <input type="number" step="0.1" className="input-wrapper" value={newConsultation.quadril} onChange={e => setNewConsultation({...newConsultation, quadril: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>% Gordura</label>
                    <input type="number" step="0.1" className="input-wrapper" value={newConsultation.percentual_gordura} onChange={e => setNewConsultation({...newConsultation, percentual_gordura: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Próximo Retorno</label>
                    <input type="date" className="input-wrapper" value={newConsultation.proximo_retorno} onChange={e => setNewConsultation({...newConsultation, proximo_retorno: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Observações</label>
                    <textarea className="input-wrapper" style={{ minHeight: '100px' }} value={newConsultation.observacoes} onChange={e => setNewConsultation({...newConsultation, observacoes: e.target.value})} />
                  </div>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ width: 'auto', background: 'white', border: '1px solid var(--border-color)' }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Salvar Consulta</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
