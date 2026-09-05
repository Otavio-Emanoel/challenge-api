# Especificação Técnica da API - Desafio de Gestão de Eventos (EventPulse)

Este documento contém toda a especificação técnica dos endpoints, schemas de dados, regras de negócio e contratos HTTP necessários para implementar o backend que se conecta ao frontend Next.js.

---

## 1. Visão Geral e Arquitetura

O frontend deste projeto foi desenvolvido para consumir diretamente uma API RESTful. Não há dados mockados no frontend. O candidato/desenvolvedor deve implementar uma API que atenda estritamente a este contrato.

- **URL Base Padrão:** `http://localhost:3333`
- **Configuração no Frontend:** A URL pode ser ajustada no arquivo `.env.local` pela variável `NEXT_PUBLIC_API_URL`.
- **CORS:** O backend **deve habilitar CORS** para a origem do frontend (por padrão `http://localhost:3000`).
- **Formato de Requisição/Resposta:** `application/json; charset=utf-8`
- **Formato de Datas:** Padrão ISO 8601 (exemplo: `2026-10-25T19:30:00.000Z`)

---

## 2. Padrão de Resposta de Erros

Quando ocorrer um erro de validação, regra de negócio ou recurso não encontrado, a API deve responder com um JSON padronizado:

```json
{
  "message": "Mensagem descritiva do erro",
  "errors": [
    {
      "field": "email",
      "message": "O formato do e-mail é inválido."
    }
  ]
}
```

---

## 3. Modelos de Dados (Entidades)

### Evento (`Event`)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único (UUID, CUID ou ID gerado pelo banco) |
| `title` | `string` | Sim | Título do evento (mínimo 3 caracteres) |
| `description`| `string` | Sim | Descrição completa do evento |
| `category` | `string` | Sim | Categoria (ex: `"Tecnologia"`, `"Design"`, `"Negócios"`, etc.) |
| `date` | `string (ISO)` | Sim | Data e horário de início do evento |
| `locationType` | `"presential" \| "online"` | Sim | Tipo de localização |
| `location` | `string` | Sim | Endereço físico (se presencial) ou link/plataforma (se online) |
| `maxCapacity` | `number` | Sim | Lotação máxima do evento (inteiro positivo >= 1) |
| `imageUrl` | `string` | Não | URL para imagem de capa/banner do evento |
| `status` | `"published" \| "draft" \| "cancelled"` | Não | Estado do evento (padrão: `"published"`) |
| `createdAt` | `string (ISO)` | Sim | Data de criação |
| `updatedAt` | `string (ISO)` | Sim | Data da última alteração |

#### Campos Computados no Evento (Retornados pela API):
- `attendeesCount` (`number`): Quantidade atual de participantes confirmados/inscritos.
- `availableSpots` (`number`): Quantidade de vagas restantes (`maxCapacity - attendeesCount`).
- `isSoldOut` (`boolean`): Indica se o evento atingiu a lotação máxima (`attendeesCount >= maxCapacity`).

---

### Participante (`Attendee`)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único da inscrição |
| `eventId` | `string` | Sim | ID do evento correspondente |
| `name` | `string` | Sim | Nome completo do participante (mínimo 2 caracteres) |
| `email` | `string` | Sim | E-mail válido do participante |
| `registeredAt` | `string (ISO)` | Sim | Data e hora em que a inscrição foi realizada |

---

## 4. Endpoints da API

### 4.1. Health Check
* **Método:** `GET`
* **Rota:** `/api/health`
* **Descrição:** Verifica se a API está online e operando.
* **Status de Sucesso:** `200 OK`
* **Exemplo de Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-04T22:30:00.000Z",
  "uptime": 3600
}
```

---

### 4.2. Métricas do Dashboard
* **Método:** `GET`
* **Rota:** `/api/dashboard/stats`
* **Descrição:** Retorna totais agregados para os cards da tela inicial do painel.
* **Status de Sucesso:** `200 OK`
* **Exemplo de Resposta:**
```json
{
  "totalEvents": 14,
  "activeRegistrations": 382,
  "soldOutEvents": 4,
  "upcomingEvents": 9
}
```

---

### 4.3. Listar Categorias
* **Método:** `GET`
* **Rota:** `/api/categories`
* **Descrição:** Retorna a lista de categorias disponíveis para filtro e cadastro.
* **Status de Sucesso:** `200 OK`
* **Exemplo de Resposta:**
```json
[
  "Tecnologia",
  "Design",
  "Negócios",
  "Marketing",
  "Desenvolvimento Pessoal",
  "Outros"
]
```

---

### 4.4. Listar Eventos
* **Método:** `GET`
* **Rota:** `/api/events`
* **Query Parameters Suportados:**
  - `search` (opcional): Filtro por texto no título ou descrição.
  - `category` (opcional): Filtro exato por categoria.
  - `status` (opcional): `"all" | "available" | "soldout" | "published" | "draft"`.
  - `page` (opcional, padrão `1`): Número da página.
  - `limit` (opcional, padrão `12`): Quantidade por página.
* **Status de Sucesso:** `200 OK`
* **Exemplo de Resposta:**
```json
{
  "events": [
    {
      "id": "evt_123456",
      "title": "Next.js & Cloud Native Summit 2026",
      "description": "Uma imersão completa em arquiteturas escaláveis, Server Actions e Edge Computing.",
      "category": "Tecnologia",
      "date": "2026-11-15T13:00:00.000Z",
      "locationType": "presential",
      "location": "Centro de Convenções Tech, São Paulo - SP",
      "maxCapacity": 100,
      "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      "status": "published",
      "attendeesCount": 78,
      "availableSpots": 22,
      "isSoldOut": false,
      "createdAt": "2026-09-01T10:00:00.000Z",
      "updatedAt": "2026-09-04T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.5. Obter Detalhes do Evento
* **Método:** `GET`
* **Rota:** `/api/events/:id`
* **Status de Sucesso:** `200 OK`
* **Status de Erro:** `404 Not Found` (quando o ID não existir).
* **Exemplo de Resposta:**
```json
{
  "id": "evt_123456",
  "title": "Next.js & Cloud Native Summit 2026",
  "description": "Uma imersão completa em arquiteturas escaláveis, Server Actions e Edge Computing.",
  "category": "Tecnologia",
  "date": "2026-11-15T13:00:00.000Z",
  "locationType": "presential",
  "location": "Centro de Convenções Tech, São Paulo - SP",
  "maxCapacity": 100,
  "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  "status": "published",
  "attendeesCount": 78,
  "availableSpots": 22,
  "isSoldOut": false,
  "createdAt": "2026-09-01T10:00:00.000Z",
  "updatedAt": "2026-09-04T15:30:00.000Z"
}
```

---

### 4.6. Criar Evento
* **Método:** `POST`
* **Rota:** `/api/events`
* **Headers:** `Content-Type: application/json`
* **Exemplo de Payload:**
```json
{
  "title": "Workshop de Design System com Figma & CSS",
  "description": "Aprenda a construir design tokens, componentes acessíveis e sincronizar Figma com código.",
  "category": "Design",
  "date": "2026-10-20T18:00:00.000Z",
  "locationType": "online",
  "location": "https://meet.google.com/xyz-abcd-efg",
  "maxCapacity": 50,
  "imageUrl": "https://images.unsplash.com/photo-1531403009284-440f080d1e12"
}
```
* **Status de Sucesso:** `201 Created`
* **Status de Erro:**
  - `400 Bad Request`: Se faltar campo obrigatório, `maxCapacity` menor que 1, ou data inválida.
* **Exemplo de Resposta:** Objeto do evento criado com `id`, `createdAt`, `attendeesCount: 0`, `isSoldOut: false`, etc.

---

### 4.7. Atualizar Evento
* **Método:** `PUT`
* **Rota:** `/api/events/:id`
* **Headers:** `Content-Type: application/json`
* **Status de Sucesso:** `200 OK`
* **Status de Erro:**
  - `400 Bad Request`: Se `maxCapacity` for alterado para um valor menor que a quantidade atual de participantes já inscritos.
  - `404 Not Found`: Evento não encontrado.
* **Exemplo de Resposta:** Objeto do evento atualizado.

---

### 4.8. Excluir Evento
* **Método:** `DELETE`
* **Rota:** `/api/events/:id`
* **Regra de Negócio:** Exclui o evento e remove/cancela em cascata todas as inscrições associadas.
* **Status de Sucesso:** `204 No Content`
* **Status de Erro:** `404 Not Found`

---

### 4.9. Listar Participantes de um Evento
* **Método:** `GET`
* **Rota:** `/api/events/:id/attendees`
* **Status de Sucesso:** `200 OK`
* **Status de Erro:** `404 Not Found` (se o evento não existir).
* **Exemplo de Resposta:**
```json
[
  {
    "id": "att_987654",
    "eventId": "evt_123456",
    "name": "Maria Silva",
    "email": "maria.silva@email.com",
    "registeredAt": "2026-09-02T14:22:10.000Z"
  },
  {
    "id": "att_987655",
    "eventId": "evt_123456",
    "name": "João Santos",
    "email": "joao.santos@email.com",
    "registeredAt": "2026-09-03T09:10:05.000Z"
  }
]
```

---

### 4.10. Inscrever Participante em Evento
* **Método:** `POST`
* **Rota:** `/api/events/:id/attendees`
* **Headers:** `Content-Type: application/json`
* **Exemplo de Payload:**
```json
{
  "name": "Carlos Eduardo",
  "email": "carlos.eduardo@empresa.com"
}
```
* **Regras de Negócio Críticas:**
  1. **Controle de Lotação:** Se `attendeesCount >= maxCapacity`, retornar `400 Bad Request` com a mensagem: `"Este evento já atingiu sua capacidade máxima de vagas."`
  2. **E-mail Único por Evento:** Não permitir cadastrar o mesmo e-mail duas vezes no mesmo evento. Se já existir, retornar `409 Conflict` com a mensagem: `"Este e-mail já está inscrito neste evento."`
  3. **Evento Inexistente:** Se o `id` do evento não existir, retornar `404 Not Found`.
  4. **Validação de Campos:** `name` deve ter pelo menos 2 caracteres e `email` deve ser sintaticamente válido.
* **Status de Sucesso:** `201 Created`
* **Exemplo de Resposta:**
```json
{
  "id": "att_987656",
  "eventId": "evt_123456",
  "name": "Carlos Eduardo",
  "email": "carlos.eduardo@empresa.com",
  "registeredAt": "2026-09-04T22:35:00.000Z"
}
```

---

### 4.11. Cancelar/Remover Inscrição de Participante
* **Método:** `DELETE`
* **Rota:** `/api/events/:id/attendees/:attendeeId`
* **Regra de Negócio:** Remove o participante do evento, liberando automaticamente uma vaga (`availableSpots` aumenta em 1).
* **Status de Sucesso:** `204 No Content`
* **Status de Erro:**
  - `404 Not Found`: Se o evento ou o participante não existirem.

---

## 5. Critérios de Avaliação e Boas Práticas Recomendadas

Para quem estiver desenvolvendo esta API, recomenda-se:
1. **Validação de Entrada:** Utilizar bibliotecas robustas de schema (como Zod, Joi, class-validator) para garantir a integridade dos dados recebidos.
2. **Camada de Serviços / Regras de Negócio:** Separar a lógica de negócios da camada de transporte (Controllers/Handlers HTTP).
3. **Persistência de Dados:** Utilizar um banco de dados relacional (ex: PostgreSQL com Prisma/Drizzle/TypeORM) ou SQLite para facilitar execução local.
4. **Tratamento Global de Erros:** Middleware centralizado para capturar exceções não tratadas e retornar status code adequado.
5. **CORS:** Configuração correta de headers `Access-Control-Allow-Origin: *` ou restrito à origem do frontend para métodos `GET, POST, PUT, DELETE, OPTIONS`.
