# 💰 Planejamento Pessoal - Front-end (v2.0 React + Vite + TypeScript)

Bem-vindo à nova versão do **Planejamento Pessoal**! O projeto foi completamente modernizado, migrando de JavaScript Vanilla para uma **Single Page Application (SPA)** moderna construída com React, TypeScript, Tailwind CSS e TanStack Query.

---

## 🚀 Tecnologias e Bibliotecas

- **[Vite](https://vitejs.dev/)** + **[React 18](https://react.dev/)**: Ferramenta de build ultrarrápida com Hot Module Replacement (HMR).
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para entidades (`User`, `Transaction`, `Group`), prevenindo erros em tempo de compilação.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária moderna com suporte a modo escuro e design responsivo.
- **[Lucide React](https://lucide.dev/)**: Ícones vetoriais modernos em SVG.
- **[TanStack Query (React Query)](https://tanstack.com/query/latest)**: Gerenciamento profissional de cache assíncrono, refetch inteligente e invalidação automática de consultas após mutações.
- **[Axios](https://axios-http.com/)**: Cliente HTTP centralizado com interceptors para envio automático do cabeçalho `Authorization: Bearer <token>`.
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)**: Formulários de alta performance e validações declarativas baseadas em schemas fortemente tipados.
- **[Recharts](https://recharts.org/)**: Gráficos declarativos em SVG para visualização de despesas por categoria.
- **[Sonner](https://sonner.emilkowal.ski/)**: Notificações em toasts flutuantes, substituindo `alert()` nativo.

---

## 📁 Estrutura de Pastas

```text
Planejamento-Pessoal-front/
├── legacy/                   # Arquivos originais em HTML/CSS/JS (mantidos para histórico)
├── public/                   # Favicon e arquivos estáticos
├── src/
│   ├── assets/               # Imagens e logotipos (Logo.png)
│   ├── components/
│   │   ├── common/           # Button, Input, Select, Modal, Badge, Card
│   │   ├── layout/           # Header (Saldo, Atalhos, Menu do Usuário)
│   │   ├── transactions/     # TransactionTable, MonthNavigator, GroupSelector, TotalsSummary, Modais
│   │   ├── settings/         # SettingsModal (Dados, Grupos, Excluir Conta)
│   │   └── charts/           # CategoryDonutChart (Recharts)
│   ├── context/              # AuthContext (Login, Logout, Sessão JWT)
│   ├── hooks/                # useTransactions, useUserActions
│   ├── pages/                # Login, Register, Dashboard
│   ├── routes/               # AppRoutes, ProtectedRoute
│   ├── services/             # api.ts (Instância Axios com baseURL e interceptors)
│   ├── types/                # Interfaces TypeScript de domínio
│   └── utils/                # Formatadores (Moeda BRL, Datas pt-BR, decodificador JWT)
├── .env                      # Variáveis de ambiente (VITE_API_URL)
├── .env.example
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Como Executar o Projeto

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** (v18 ou superior) instalado.

### 2. Instalação das dependências
```bash
npm install
```

### 3. Rodar em ambiente de desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

### 4. Build de produção
```bash
npm run build
```

---

## 💡 Regras de Negócio Implementadas

1. **Autenticação Segura**:
   - Token JWT decodificado no cliente para identificação do `userId`.
   - "Lembrar de mim": persiste em `localStorage`, caso desmarcado salva em `sessionStorage`.
   - Rotas protegidas: redireciona usuários não autenticados para `/login`.

2. **Gestão de Transações**:
   - Filtro mensal (`GET /transactions/:userId/:month/:year`) com navegação de meses.
   - Filtro por grupos de gastos (`GET /transactions/:userId/:group`).
   - Adicionar transação: se o tipo for `Pix` ou `Débito`, desconta automaticamente do saldo (`balance`).
   - Excluir transação: botão direto na linha com modal de confirmação; se for `Pix` ou `Débito`, estorna o valor ao saldo do usuário.

3. **Saldo e Atalhos**:
   - Botão para ocultar/exibir saldo com máscara (`•••••••••`).
   - `+ Salário`: soma o salário configurado ao saldo atual.
   - `- Fatura`: debita o total atual da fatura do saldo atual.

4. **Configurações do Usuário**:
   - Edição de Salário, Saldo e Dia de Fechamento da Fatura (1 a 28).
   - Gerenciamento de Grupos (criação e remoção, protegendo o padrão "Dia a dia").
   - Exclusão definitiva de conta com aviso e confirmação.
