# Virtual Pet Doctor

## Sobre o Projeto

O **Virtual Pet Doctor** e um assistente de saude virtual baseado em IA que ajuda pessoas com doencas cronicas a gerenciar sua saude atraves do WhatsApp. O sistema utiliza a plataforma Dify AI para fornecer conversas inteligentes com RAG (Retrieval-Augmented Generation) especializadas em doencas cronicas.

## Funcionalidades

### Assistente de Saude via WhatsApp
- Conversas inteligentes com IA especializada em doencas cronicas
- Suporte a perguntas sobre medicamentos, sintomas e gerenciamento de saude
- Manutencao do contexto da conversa ao longo das mensagens
- Criacao automatica de usuarios ao primeiro contato

### Lembretes de Medicamentos
- Criacao de lembretes recorrentes com expressoes cron
- Mensagens personalizadas para cada lembrete
- Ativacao/desativacao de lembretes
- Envio automatico de lembretes via WhatsApp

### Gestao de Usuarios
- Criacao automatica de usuarios a partir do WhatsApp
- Sessoes de chat individuais por usuario
- Timeout de sessao (5 minutos de inatividade)
- Historico de conversas

## Arquitetura

O projeto foi construido com as seguintes tecnologias:

- **Framework:** NestJS com TypeScript
- **Banco de Dados:** PostgreSQL com Prisma ORM
- **Integracao IA:** Dify AI Platform
- **Mensageria:** WhatsApp via WAHA API
- **Agendamento:** Cron jobs com `@nestjs/schedule`
- **Documentacao:** Swagger/OpenAPI

### Documentacao
- `GET /api` - Interface Swagger para documentacao da API

## Configuracao

### Variaveis de Ambiente

Crie um arquivo `.env` com as seguintes variaveis:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/virtual_pet_doctor"

# WAHA API (WhatsApp)
WAHA_API_URL="https://seu-waha-api.com"
WAHA_API_KEY="sua-chave-waha"
API_URL="https://seu-api-url.com"

# Dify AI
DIFY_API_KEY="sua-chave-dify"
```

### Instalacao

1. Clone o repositorio:
```bash
git clone https://github.com/seu-usuario/virtual-pet-doctor.git
cd virtual-pet-doctor
```

2. Instale as dependencias:
```bash
pnpm install
```

3. Configure o Prisma:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Inicie o projeto em modo de desenvolvimento:
```bash
pnpm run start:dev
```

## Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `pnpm run start:dev` | Inicia em modo desenvolvimento |
| `pnpm run start:prod` | Inicia em modo producao |
| `pnpm run build` | Compila o projeto |
| `pnpm run lint` | Executa o linter |
| `pnpm run test` | Executa os testes unitarios |
| `pnpm run test:e2e` | Executa os testes e2e |

## Caso de Uso

Este aplicativo foi projetado especificamente para **pessoas com doencas cronicas** que necessitam de:

- Gerenciamento de medicamentos e lembretes
- Informacoes sobre saude e suporte via WhatsApp
- Acesso facil a assistencia de saude atraves de uma plataforma de mensagens familiar
- Conversas personalizadas com assistencia de IA

O sistema e voltado para individuos de lingua portuguesa que gerenciam condicoes cronicas como diabetes, hipertensao ou outros problemas de saude de longo prazo que exigem medicacao regular e monitoramento.

## Integracao com Dify

O Dify AI e configurado para:

- **RAG (Retrieval-Augmented Generation):** Conhecimento especializado sobre doencas cronicas
- **Ferramentas disponiveis:**
  - Obtencao de dados em tempo real
  - Configuracao de lembretes para o usuario
- **Manutencao de contexto:** Sessoes com timeout de 5 minutos
- **Respostas em portugues:** Configurado para usuarios lusofonos

## Licenca

UNLICENSED
