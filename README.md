# NutriSystem — Sistema de Gestão para Nutricionistas

O **NutriSystem** é uma plataforma web moderna e intuitiva desenvolvida para facilitar o dia a dia de profissionais da nutrição. O sistema centraliza a gestão de pacientes, o acompanhamento de consultas com gráficos de evolução e a organização de planos alimentares.

## 🚀 Funcionalidades Principais

- **Autenticação Segura**: Sistema de login e cadastro exclusivo para nutricionistas via Supabase Auth.
- **Dashboard Estratégico**: Visão geral com métricas de pacientes ativos, consultas da semana e alertas de pacientes sem retorno há mais de 30 dias.
- **Gestão de Pacientes**: Cadastro detalhado dividido em abas (Pessoal, Clínico e Hábitos) com cálculos automáticos de idade e IMC.
- **Histórico de Consultas**: Registro de medidas corporais e acompanhamento visual através de gráficos de evolução de peso.
- **Isolamento de Dados**: Cada nutricionista acessa apenas seus próprios dados, garantindo total privacidade e segurança (RLS).

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilização**: CSS Vanilla (Design System customizado)
- **Banco de Dados & Auth**: [Supabase](https://supabase.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Roteamento**: React Router DOM

## 🛠️ Como o projeto foi desenvolvido

O desenvolvimento foi realizado seguindo uma abordagem modular e orientada a funcionalidades:

1.  **Infraestrutura de Dados**: Modelagem do banco de dados no Postgres (Supabase) com foco em integridade referencial e políticas de segurança (Row Level Security).
2.  **Arquitetura Frontend**: Estruturação de componentes reutilizáveis (Sidebar, Modais, Inputs) para garantir consistência visual.
3.  **Segurança**: Implementação de fluxos de autenticação que vinculam automaticamente cada registro (paciente/consulta) ao ID do profissional logado.
4.  **UX/UI**: Design focado na área da saúde, utilizando uma paleta de cores verde/branco, tipografia legível e feedbacks visuais de sucesso/erro.
5.  **Otimização de SPA**: Configuração de rotas e tratativa de erros de carregamento (como o redirecionamento 404 em refresh).

## 💻 Como rodar o projeto localmente

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/FernandoCalumbi/nutriferiani.git
    ```
2.  **Instale as dependências**:
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente**:
    - Crie um arquivo `.env` baseado no `.env.example`.
    - Adicione suas credenciais do Supabase (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

---
Desenvolvido com foco em excelência e praticidade para o profissional de nutrição.
