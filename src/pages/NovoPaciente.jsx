import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Save, ArrowLeft, CheckCircle, Info, Heart, Coffee } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function NovoPaciente() {
  const [activeTab, setActiveTab] = useState('pessoal')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState({
    // Pessoal
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    // Clínico
    peso_inicial: '',
    altura: '',
    objetivos: [],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [],
    restricoes_alimentares: [],
    alergias: [],
    medicamentos: '',
    suplementos: '',
    // Hábitos
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  })

  // Calculations
  const [age, setAge] = useState(null)
  const [imc, setImc] = useState(null)

  useEffect(() => {
    if (formData.data_nascimento) {
      const birth = new Date(formData.data_nascimento)
      const today = new Date()
      let calculatedAge = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--
      }
      setAge(calculatedAge)
    }
  }, [formData.data_nascimento])

  useEffect(() => {
    if (formData.peso_inicial && formData.altura) {
      const weight = parseFloat(formData.peso_inicial)
      const height = parseFloat(formData.altura) / 100
      if (weight > 0 && height > 0) {
        setImc((weight / (height * height)).toFixed(1))
      }
    }
  }, [formData.peso_inicial, formData.altura])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleMultiSelect = (category, value) => {
    setFormData(prev => {
      const current = prev[category]
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) }
      } else {
        return { ...prev, [category]: [...current, value] }
      }
    })
  }

  const formatTime = (value) => {
    if (!value) return ''
    const str = value.toString().replace(/\D/g, '')
    if (str.length <= 2) return str.padStart(2, '0') + ':00'
    const h = str.slice(0, str.length - 2).padStart(2, '0')
    const m = str.slice(-2).padStart(2, '0')
    return `${h}:${m}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...formData,
          nutricionista_id: session.user.id,
          // Format times for storage if needed, or keep as string as per schema
          horario_acorda: formatTime(formData.horario_acorda),
          horario_dorme: formatTime(formData.horario_dorme)
        }])
        .select()
        .single()

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        navigate(`/pacientes/${data.id}`)
      }, 2000)
    } catch (error) {
      console.error('Error saving patient:', error)
      alert('Erro ao salvar paciente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem' }}>
          <button onClick={() => navigate('/pacientes')} className="btn" style={{ width: 'auto', background: 'none', padding: 0, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <ArrowLeft size={20} /> Voltar para listagem
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Novo Paciente</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Preencha os dados para iniciar o acompanhamento.</p>
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={24} />
            Paciente cadastrado com sucesso! Redirecionando...
          </div>
        )}

        <div className="table-card" style={{ padding: '2rem' }}>
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`}
              onClick={() => setActiveTab('pessoal')}
            >
              <Info size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Pessoal
            </button>
            <button 
              className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`}
              onClick={() => setActiveTab('clinico')}
            >
              <Heart size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Clínico
            </button>
            <button 
              className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`}
              onClick={() => setActiveTab('habitos')}
            >
              <Coffee size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Hábitos
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* TAB: PESSOAL */}
            {activeTab === 'pessoal' && (
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nome Completo *</label>
                  <div className="input-wrapper">
                    <input name="nome" value={formData.nome} onChange={handleInputChange} required placeholder="Ex: Maria Oliveira" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <div className="input-wrapper">
                    <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleInputChange} />
                  </div>
                  {age !== null && <small style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Idade: {age} anos</small>}
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleInputChange} className="input-wrapper" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <option value="">Selecione</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <div className="input-wrapper">
                    <input name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <div className="input-wrapper">
                    <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="(00) 90000-0000" />
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>E-mail</label>
                  <div className="input-wrapper">
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="exemplo@email.com" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CLÍNICO */}
            {activeTab === 'clinico' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Peso Atual</label>
                  <div className="input-wrapper">
                    <input type="number" name="peso_inicial" value={formData.peso_inicial} onChange={handleInputChange} placeholder="0.0" />
                    <span className="input-group-text">kg</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Altura</label>
                  <div className="input-wrapper">
                    <input type="number" name="altura" value={formData.altura} onChange={handleInputChange} placeholder="0" />
                    <span className="input-group-text">cm</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>IMC</label>
                  <div className="input-wrapper">
                    <input value={imc || ''} readOnly style={{ background: '#f1f5f9' }} placeholder="0.0" />
                  </div>
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Objetivos</label>
                  <div className="checkbox-group">
                    {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                      <label key={obj} className="checkbox-item">
                        <input type="checkbox" checked={formData.objetivos.includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} />
                        {obj}
                      </label>
                    ))}
                  </div>
                  <div className="input-wrapper" style={{ marginTop: '1rem' }}>
                    <input name="objetivo_texto" value={formData.objetivo_texto} onChange={handleInputChange} placeholder="Outros detalhes sobre o objetivo..." />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nível de Atividade Física</label>
                  <select name="nivel_atividade" value={formData.nivel_atividade} onChange={handleInputChange} className="input-wrapper" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <option value="">Selecione</option>
                    <option value="Sedentário">Sedentário</option>
                    <option value="Levemente ativo">Levemente ativo</option>
                    <option value="Moderadamente ativo">Moderadamente ativo</option>
                    <option value="Muito ativo">Muito ativo</option>
                    <option value="Extremamente ativo">Extremamente ativo</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Patologias ou Condições de Saúde</label>
                  <div className="checkbox-group">
                    {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].map(pat => (
                      <label key={pat} className="checkbox-item">
                        <input type="checkbox" checked={formData.patologias.includes(pat)} onChange={() => handleMultiSelect('patologias', pat)} />
                        {pat}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HÁBITOS */}
            {activeTab === 'habitos' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Refeições por dia</label>
                  <div className="input-wrapper">
                    <input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Horário que acorda</label>
                  <div className="input-wrapper">
                    <input type="number" name="horario_acorda" value={formData.horario_acorda} onChange={handleInputChange} placeholder="Ex: 630" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Horário que dorme</label>
                  <div className="input-wrapper">
                    <input type="number" name="horario_dorme" value={formData.horario_dorme} onChange={handleInputChange} placeholder="Ex: 2300" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Água por dia</label>
                  <div className="input-wrapper">
                    <input type="number" name="litros_agua" value={formData.litros_agua} onChange={handleInputChange} />
                    <span className="input-group-text">litros</span>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="checkbox-item">
                    <input type="checkbox" name="atividade_fisica" checked={formData.atividade_fisica} onChange={handleInputChange} />
                    Pratica atividade física?
                  </label>
                  {formData.atividade_fisica && (
                    <div className="input-wrapper" style={{ marginTop: '0.5rem' }}>
                      <textarea name="atividade_fisica_descricao" value={formData.atividade_fisica_descricao} onChange={handleInputChange} placeholder="Qual atividade e frequência semanal?" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px' }}></textarea>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate('/pacientes')} className="btn" style={{ width: 'auto', background: 'white', border: '1px solid var(--border-color)' }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
                {loading ? 'Salvando...' : (
                  <>
                    <Save size={20} />
                    Salvar Paciente
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
