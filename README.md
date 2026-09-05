# EventPulse - Desafio Técnico de Desenvolvimento de API & Frontend

Bem-vindo ao **EventPulse**! Este repositório contém o frontend de uma plataforma de **Gestão de Eventos e Inscrições** e a especificação completa para o desenvolvimento de uma API backend.

---

## 🎯 Sobre o Desafio

O objetivo deste desafio técnico é **desenvolver a API backend** capaz de alimentar este frontend.

- O frontend **não utiliza dados mockados** — ele consome diretamente a API real.
- Todos os endpoints, schemas de dados, validações e regras de negócio esperadas estão detalhados no arquivo [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) e na rota `/docs` dentro da própria aplicação web.
- Quando o backend estiver rodando na porta correta, o frontend passará a listar eventos, registrar novos eventos, gerenciar participantes e exibir métricas em tempo real.

---

## ⚙️ Como Executar o Frontend

### 1. Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes npm, pnpm ou yarn

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Configuração de Ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Por padrão, o frontend procura a API em `http://localhost:3333`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```
*(Caso sua API rode em outra porta, basta ajustar essa variável).*

### 4. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧪 Validador Automatizado de API & Avaliação de Nota (0 a 10)

Para testar sua API backend de ponta a ponta e saber sua nota imediatamente, utilize os scripts inclusos no projeto:

### No Windows:
- **Opção 1 (Batch):** Dê um duplo clique no arquivo `validate-api.bat` (ou execute `.\validate-api.bat` no CMD).
- **Opção 2 (PowerShell):** Execute `.\validate-api.ps1` no PowerShell.

### No Linux / macOS:
```bash
./validate-api.sh
```

### Ou diretamente via npm:
```bash
npm run validate
```

O script perguntará a URL da sua API (padrão: `http://localhost:3333`), executará 15 testes de conformidade técnica e regras de negócio (limite de vagas, e-mail duplicado, CRUD, status codes) e exibirá:
- ✅ Status de aprovação de cada endpoint
- ⚠️ Detalhamento de falhas e motivos
- 📊 **Nota final de 0.0 a 10.0** com classificação (Excelente, Bom, Regular ou Insuficiente)

---

## 📋 Regras de Negócio Principais da API
1. **Lotação Máxima:** Não permitir inscrições além da capacidade (`maxCapacity`) definida no evento (`400 Bad Request`).
2. **E-mail Único:** Um mesmo participante (e-mail) não pode se inscrever mais de uma vez no mesmo evento (`409 Conflict`).
3. **Cancelamento:** Ao remover a inscrição de um participante, uma vaga deve ser liberada imediatamente.
4. **CORS:** O backend precisa aceitar requisições de `http://localhost:3000`.

Para detalhes completos de rotas e exemplos JSON, consulte [`API_SPECIFICATION.md`](./API_SPECIFICATION.md).
