## TodoList Soulslike 🗡️
Uma aplicação de lista de tarefas épica inspirada nos jogos Souls-like, oferecendo múltiplas arquiteturas e tecnologias para uma experiência completa de desenvolvimento.
### Visão Geral
O TodoList Soulslike é um projeto ambicioso que implementa um sistema de gerenciamento de tarefas utilizando diferentes tecnologias e arquiteturas, proporcionando uma experiência de desenvolvimento completa e diversificada.

todolist-soulslike/
├── backend/                    # Backend Laravel com MCP
│   ├── app/                    # Endpoints da API
│   ├── database/              # Configurações dos 3 BDs
│   └── mcp/                   # Implementação MCP
├── frontend-vanilla/          # Frontend Vanilla JS
├── frontend-nextjs/           # Frontend Next.js
├── mobile-react-native/       # App React Native
├── docs/                      # Documentação
└── localization/              # Arquivos de tradução (27 idiomas)

## ✨ Características Principais

### 🔧 Backend (Laravel + PHP)
- **Framework**: Laravel 10+
- **Padrão**: MCP (Model-Controller-Provider)
- **APIs**: REST endpoints com suporte a JSON e XML

- **Documentação**: Swagger/OpenAPI

###  Múltiplos Bancos de Dados
1. **MySQL** - Banco principal para dados estruturados
2. **MongoDB** - Para dados flexíveis e logs
3. **SQlite** - para quem não quiser fazer as migrações (pode gerar erros)

###  Frontend's
1. **Vanilla JavaScript** -  (sem frameworks )
2. **Next.js** - Framework React com SSR/SSG
3. **React Native** - React Native com o expo



### 📡 API Flexível
- Retorno em **JSON** e **XML**
- Versionamento da API

## 🚀 Tecnologias Utilizadas

### Backend
- PHP 8.2+
- Laravel 10+
- PostGreSQL 8.0+
- MySQL 8.0+
- MongoDB 6.0+
- sqlite 7.0+

- Swagger UI

### Frontend
- **Vanilla**: HTML5, CSS3, JavaScript ES6+
- **Next.js**: React 18+, TypeScript, Tailwind CSS
- **React Native**: Expo, Navigation, AsyncStorage

### DevOps & Ferramentas
- GitHub Actions (CI/CD)
- ESLint & Prettier
- PHPStan & PHPCS

## 📋 Pré-requisitos

- PHP 8.2+
- Node.js 18+
- Git

## 🔧 Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/todolist-soulslike.git
cd todolist-soulslike