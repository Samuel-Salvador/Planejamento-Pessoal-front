# 🧠 GEMINI.md - Planejamento Pessoal (Front-end)

Este documento fornece uma visão técnica e arquitetural detalhada do front-end do projeto **Planejamento Pessoal**, desenvolvido como uma **Single Page Application (SPA)** moderna, performática e modular.

---

## 📌 Visão Geral do Projeto

O front-end do **Planejamento Pessoal** é uma aplicação web para gestão de finanças pessoais que permite controlar transações mensais, acompanhar faturas de cartão de crédito e despesas à vista (Débito e Pix), visualizar a distribuição de despesas por categoria através de gráficos dinâmicos, e gerenciar salários e metas em grupos personalizados.

- **Repositório**: `Planejamento-Pessoal-front`
- **Hospedagem em Produção**: [Vercel](https://planejamento-pessoal.vercel.app)
- **API Backend Consumida**: [Heroku API](https://plan-pessoal-93978f82c0a7.herokuapp.com/) (Spring Boot)

---

## 🛠️ Stack Tecnológica & Decisões Arquiteturais

| Tecnologia | Finalidade | Justificativa / Conceito |
|---|---|---|
| **Vite 5** | Ferramenta de Build & Dev Server | Oferece Hot Module Replacement (HMR) ultrarrápido baseado em ES Modules nativos no navegador. |
| **React 18** | Biblioteca UI | Arquitetura declarativa baseada em componentes reativos, hooks customizados e renderização eficiente. |
| **TypeScript 5** | Linguagem | Tipagem estática rigorosa para entidades de negócio (`User`, `Transaction`), reduzindo bugs em tempo de desenvolvimento. |
| **Tailwind CSS 3** | Estilização Utilitária | Design system responsivo, consistente e com tema escuro (Dark Theme), sem CSS global inflado. |
| **Lucide React** | Iconografia | Ícones vetoriais SVG leves, customizáveis e acessíveis. |
| **TanStack Query v5** | Gerenciamento de Estado de Servidor | Gerencia cache assíncrono, invalidações automáticas de dados após mutações (`useMutation`) e estados de carregamento. |
| **Axios** | Cliente HTTP | Instância centralizada com interceptors para envio automático do cabeçalho `Authorization: Bearer <token>`. |
| **React Hook Form + Zod** | Formulários & Validação | Formulários não controlados de alta performance integrados com esquemas de validação declarativos e fortemente tipados. |
| **Recharts** | Visualização de Dados | Gráficos declarativos em SVG vetorial adaptados para o ecossistema React. |
| **Sonner** | Feedback Visual (Toasts) | Notificações flutuantes modernas que substituem diálogos nativos `alert()`. |

---

## 📁 Estrutura de Diretórios

```text
Planejamento-Pessoal-front/
├── legacy/                   # Arquivos originais em Vanilla JS/HTML/CSS (preservados para histórico)
├── public/                   # Favicon e ativos estáticos públicos
├── src/
│   ├── assets/               # Imagens e marcas (Logo.png)
│   ├── components/           # Componentes reutilizáveis
│   │   ├── charts/           # Gráfico Donut de categorias (CategoryDonutChart.tsx)
│   │   ├── common/           # Componentes base (Button, Input, Select, Modal, Badge, Card)
│   │   ├── layout/           # Cabeçalho, controle de saldo e menu (Header.tsx)
│   │   ├── settings/         # Modal de configurações com abas (SettingsModal.tsx)
│   │   └── transactions/     # Tabela, formulários e navegação (TransactionTable, AddTransactionModal, DeleteTransactionModal, MonthNavigator, GroupSelector, TotalsSummary)
│   ├── context/              # Provedores de contexto global (AuthContext.tsx)
│   ├── hooks/                # Hooks TanStack Query (useTransactions.ts, useUserActions.ts)
│   ├── pages/                # Telas da aplicação (Login.tsx, Register.tsx, Dashboard.tsx)
│   ├── routes/               # Configuração do React Router (AppRoutes.tsx, ProtectedRoute.tsx)
│   ├── services/             # Instância configurada do Axios (api.ts)
│   ├── types/                # Interfaces TypeScript de domínio (index.ts)
│   ├── utils/                # Formatadores de moeda BRL, datas pt-BR e decodificador JWT (index.ts)
│   ├── App.tsx               # Montagem de provedores globais (QueryClient, AuthProvider, Toaster)
│   ├── main.tsx              # Ponto de entrada React com StrictMode
│   ├── index.css             # Diretivas do Tailwind CSS e estilos base
│   └── vite-env.d.ts         # Tipagem de variáveis de ambiente do Vite
├── .env                      # Variáveis de ambiente locais
├── .env.example              # Exemplo de configuração de variáveis
├── package.json              # Dependências e scripts npm
├── postcss.config.js         # Configuração PostCSS para Tailwind
├── tailwind.config.js        # Configuração de temas e cores do Tailwind
├── tsconfig.json             # Configuração do compilador TypeScript
├── vercel.json               # Regras de reescrita para SPA Routing na Vercel
└── vite.config.ts            # Configuração do Vite com Proxy reverso
```

---

## 🔐 Autenticação & Sessão

1. **Decodificação de JWT no Cliente**:
   - O token JWT recebido no endpoint `POST /login` contém a claim customizada `id` (ID do usuário no banco).
   - O helper `decodeJWT()` extrai o payload Base64 para sincronizar a sessão.
2. **Persistência**:
   - Marcando "Lembrar de mim", as credenciais/tokens são salvas em `localStorage`.
   - Sem marcar, os dados ficam em `sessionStorage` e expiram ao fechar a aba.
3. **Interceptors do Axios**:
   - Anexam automaticamente `Authorization: Bearer <token>` em todas as requisições autenticadas.
   - Em caso de 401/403 em rotas protegidas, limpam a sessão e redirecionam para `/login`.
4. **Proteção de Rotas**:
   - `ProtectedRoute.tsx`: Redireciona usuários deslogados para `/login`.
   - `PublicOnlyRoute.tsx`: Redireciona usuários logados para o Dashboard `/`.

---

## 💼 Regras de Negócio e Funcionalidades

### 1. Gestão de Transações
- **Listagem Mensal**: `GET /transactions/:userId/:month/:year` respeitando o dia de fechamento da fatura do usuário.
- **Filtro por Grupos**: `GET /transactions/:userId/:group` para isolar gastos de eventos (ex: "Viagem", "Reforma").
- **Criação de Transação**: `POST /transactions`
  - Se for do tipo **Pix** ou **Débito**, atualiza automaticamente o saldo do usuário com débito imediato (`PUT /users/:userId`).
- **Exclusão de Transação**: Botão direto na linha da tabela com modal de confirmação.
  - Se for **Pix** ou **Débito**, realiza o **estorno automático** do valor ao saldo do usuário.

### 2. Painel de Totais & Gráfico
- **Total Fatura**: Somatório das transações com tipo `Crédito`.
- **Total Débitos**: Somatório das transações com tipo `Débito` ou `Pix`.
- **Gráfico Donut de Categorias**: Agrupa dinamicamente despesas por categoria. A legenda é desenhada em HTML `flex-wrap`, expandindo o card verticalmente de forma natural à medida que categorias aumentam.

### 3. Saldo e Ações Rápidas
- **Máscara de Saldo**: Alternador para ocultar (`•••••••••`) ou exibir (`R$ 1.250,00`) o saldo no topo.
- **+ Salário**: Soma o salário configurado ao saldo atual (`PUT /users/:userId`).
- **- Fatura**: Subtrai o total calculado da fatura do saldo atual (`PUT /users/:userId`).

### 4. Modal de Configurações
- **Aba Dados**: Edição de Salário, Saldo e Dia de Fechamento da Fatura (1 a 28). Exibição de perfil.
- **Aba Grupos**: Cadastro e exclusão de grupos de gastos (com proteção para não remover "Dia a dia").
- **Aba Excluir Conta**: Confirmação e chamada a `DELETE /users/:userId`.

---

## 🌐 Configuração de Ambientes e CORS

- **Desenvolvimento Local (`npm run dev`)**:
  - O Vite utiliza um **proxy reverso** configurado em `vite.config.ts`:
    - Requisições para `/api/*` são encaminhadas internamente para `https://plan-pessoal-93978f82c0a7.herokuapp.com/*`.
    - Injeta o cabeçalho `Origin: https://planejamento-pessoal.vercel.app`, evitando bloqueios de CORS ao testar localmente.
- **Produção na Vercel**:
  - Comunicação direta com a API do Heroku (autorizada no CORS do backend).
  - Arquivo `vercel.json` garante que qualquer recarregamento em rotas como `/login` seja direcionado ao `index.html`.

---

## 🚀 Como Rodar o Projeto

```powershell
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# 3. Gerar build de produção
npm run build

# 4. Pré-visualizar build local
npm run preview
```
