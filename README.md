## TodoList Soulslike 🗡️
Uma experiencia souls-like de fazer de lista de tarefas épica, oferecendo múltiplas arquiteturas e tecnologias para uma experiência completa de desenvolvimento.


# Arquitetura do Projeto
todolist-soulslike/
|
├── backend/                   
│   ├── app/                   
│   ├── database/             
│   └── routes/                 
├── frontend_3d/          
├── frontend_next/           
└──  frontend_mobile/      


##  Características Principais

###  Backend (Laravel + PHP)
- **Framework**: Laravel 10+
- **Padrão**: MCP (Model-Controller-Provider)
- **APIs**: REST endpoints com suporte a JSON e XML

- **Documentação**: Swagger/OpenAPI

###  Múltiplos Bancos de Dados
1. **Postgresql** - Banco principal escolhido

2. **MySql** - Dados replicado do principal
3. **SQlite** - Para quem não quiser fazer configurar as 3 conexões (pode gerar erros)

###  Frontend's
1. **Vanilla JavaScript** -  (sem frameworks )
2. **Next.js** - Framework React com SSR/SSG
3. **React Native** - React Native com o expo



###  API 
- Retorno em **JSON** e **XML**
- Versionamento da API

##  Tecnologias Utilizadas

### Backend
- PHP 8.2+
- Laravel 10+
- PostGreSQL 8.0+
- MySQL 8.0+
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
```

### 2. Configurar Backend (Laravel)
```bash

cd backend

# Instalar dependências PHP
composer install

# Configurar ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Configurar banco de dados no .env 
# -- dar para usar só um também, ou os 3 se quiser (o padrão e o sqlite)
# Para SQLite (mais simples)
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

#  para PostgreSQL
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=todolist_soulslike
# DB_USERNAME=seu_usuario
# DB_PASSWORD=sua_senha

#  para MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=todolist_soulslike
# DB_USERNAME=seu_usuario
# DB_PASSWORD=sua_senha



# Executar migrações
php artisan migrate

# Gerar dados de exemplo
php artisan db:seed

#se usar os 3 bandos de dados
php artisan app:seed-all
php artisan app:migrate-all

# Iniciar servidor
php artisan serve

```



## Configurar Frontend Vanilla

```bash
cd frontend_3d

#instalar a extenção liver_server e abrir na url 

http://127.0.0.1:5500/frontend_3d/
 
```

### visão geral



https://github.com/user-attachments/assets/766623d3-b77c-460f-ae10-056c11be4022


## Configurar Frontend Next.js

```bash
cd frontend_next

# Instalar dependências
npm install

#executar o servidor
npm run dev

#abrir em
http://localhost:3000/
 
```
### visão geral


https://github.com/user-attachments/assets/d5522116-26e6-4437-b4be-63433d559e42





## Configurar Frontend mobile

```bash
cd frontend_mobile

# Instalar dependências
npm install

# Iniciar projeto
npx expo start

#abrir em
http://localhost:8081

# -- no celular deve retornar erro do exios, por conta do localhost, mas pode rodar no android studios


#mas pode rodar na maquina virtual no android studios
npx expo run:android

```
### visão geral


https://github.com/user-attachments/assets/f63e0f31-b54b-471b-8f9c-3cf3ab0d391e



## Documentação da API

```bash
cd backend

#para gerar a documentação 
php artisan scribe:generate

```


### interfaces Disponíveis
## Scalar (Interface Moderna) 

- URL: http://localhost:8000/scalar
- Características: Interface dark theme, tema Soulslike personalizado

- Recursos: Visualização interativa, exemplos de código, teste de endpoints (apenas GET)

### visão geral
https://github.com/user-attachments/assets/d69cfdef-1961-4945-8497-601dcf8d4ec8







## Scribe (Interface Tradicional)


https://github.com/user-attachments/assets/ad2801e2-673a-4851-8a67-ac55acb1f9af


- URL: http://localhost:8000/docs
- Características:  Documentação HTML estática completa

- Recursos: Exemplos completos, Postman collection, OpenAPI spec

### visão geral


### Endpoints Principais
#### (todos - lista de tarefas)
- GET /api/v1/todos - Listar de listas_de_tarefas
- POST /api/v1/todos - Criar listas_de_tarefas
- PUT /api/v1/todos/{id} - Atualizar listas_de_tarefa
- DELETE /api/v1/todos/{id} - Deletar listas_de_tarefa
#### (todos - lista de tarefas)

- GET /api/v1/task - Listar tarefas
- POST /api/v1/task - Criar tarefas
- PUT /api/v1/task/{id} - Atualizar tarefa
- DELETE /api/v1/task/{id} - Deletar tarefa


### Regenerar Documentação

```bash


# Após modificar endpoints
php artisan scribe:generate

# Documentação será atualizada automaticamente em ambas as interfaces

#acessar para ver as atualizações: http://localhost:8000/docs

```

### Exemplo de Resposta JSON


```bash

{
  "data": [
    {
      "id": 1,
      "title": "Derrotar o Chefe Final",
      "description": "Completar a fase mais difícil",
      "completed": false,
      "difficulty": "nightmare",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1
  }
}

```

### Exemplo de Resposta XML


```bash

<?xml version="1.0" encoding="UTF-8"?>
<response>
  <data>
    <todo>
      <id>1</id>
      <title>Derrotar o Chefe Final</title>
      <description>Completar a fase mais difícil</description>
      <completed>false</completed>
      <difficulty>nightmare</difficulty>
      <created_at>2025-01-01T00:00:00Z</created_at>
    </todo>
  </data>
</response>
```
