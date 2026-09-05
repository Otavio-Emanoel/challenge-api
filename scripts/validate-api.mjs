#!/usr/bin/env node

/**
 * EventPulse - Validador Automatizado de Desafio de API
 * Avalia conformidade dos contratos, regras de negócio e gera uma nota de 0 a 10.
 */

import readline from 'node:readline';

// Configurações de Cores ANSI para Terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function promptUrl() {
  if (process.argv[2]) {
    return Promise.resolve(process.argv[2]);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `\n${colors.cyan}${colors.bright}Informe a URL base da API a ser validada${colors.reset} ${colors.dim}[Padrão: http://localhost:3333]${colors.reset}: `,
      (answer) => {
        rl.close();
        const trimmed = answer.trim();
        resolve(trimmed || 'http://localhost:3333');
      }
    );
  });
}

async function runValidation() {
  console.clear();
  console.log(`${colors.magenta}${colors.bright}`);
  console.log(`===============================================================`);
  console.log(`        ⚡ EVENTPULSE - VALIDADOR DE DESAFIO BACKEND ⚡       `);
  console.log(`===============================================================`);
  console.log(`${colors.reset}`);

  let baseUrl = await promptUrl();
  baseUrl = baseUrl.replace(/\/+$/, '');

  console.log(`\n${colors.blue}🎯 Alvo de teste:${colors.reset} ${colors.bright}${baseUrl}${colors.reset}`);
  console.log(`${colors.dim}Iniciando execução da suíte de 15 testes de conformidade...${colors.reset}\n`);

  const results = [];
  let sharedEventId = '';
  let sharedCapacityEventId = '';
  let sharedAttendeeId = '';

  const runTest = async (name, weight, fn) => {
    process.stdout.write(`  ⏳ ${name.padEnd(65, '.')} `);
    try {
      const res = await fn();
      if (res.ok) {
        process.stdout.write(`${colors.green}${colors.bright}[APROVADO (+${weight.toFixed(1)})]${colors.reset}\n`);
        results.push({ name, weight, passed: true, score: weight, details: res.details });
      } else {
        process.stdout.write(`${colors.red}${colors.bright}[FALHOU (0.0)]${colors.reset}\n`);
        results.push({ name, weight, passed: false, score: 0, details: res.details });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`${colors.red}${colors.bright}[ERRO (0.0)]${colors.reset}\n`);
      results.push({ name, weight, passed: false, score: 0, error: msg });
    }
  };

  // Helper para fetch com timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 4000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  // 1. GET /api/health
  await runTest('1. GET /api/health (Healthcheck e Uptime)', 0.5, async () => {
    const res = await fetchWithTimeout(`${baseUrl}/api/health`);
    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') return { ok: false, details: 'Corpo não é um JSON válido' };
    return { ok: true, details: 'Healthcheck 200 OK' };
  });

  // 2. GET /api/categories
  await runTest('2. GET /api/categories (Listagem de Categorias)', 0.5, async () => {
    const res = await fetchWithTimeout(`${baseUrl}/api/categories`);
    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!Array.isArray(data)) return { ok: false, details: 'Resposta deve ser um array de categorias' };
    return { ok: true, details: `Retornou ${data.length} categorias` };
  });

  // 3. GET /api/dashboard/stats
  await runTest('3. GET /api/dashboard/stats (Métricas Agregadas)', 0.5, async () => {
    const res = await fetchWithTimeout(`${baseUrl}/api/dashboard/stats`);
    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!data || typeof data.totalEvents !== 'number') {
      return { ok: false, details: 'Campo totalEvents numérico ausente' };
    }
    return { ok: true, details: 'Métricas retornadas com sucesso' };
  });

  // 4. GET /api/events
  await runTest('4. GET /api/events (Listagem de Eventos)', 0.5, async () => {
    const res = await fetchWithTimeout(`${baseUrl}/api/events`);
    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    const events = Array.isArray(data) ? data : data?.events;
    if (!Array.isArray(events)) {
      return { ok: false, details: 'Resposta deve ser array de eventos ou objeto com { events: [...] }' };
    }
    return { ok: true, details: 'Listou eventos com sucesso' };
  });

  // 5. POST /api/events
  await runTest('5. POST /api/events (Criação de Evento Válido)', 1.0, async () => {
    const payload = {
      title: `Evento de Teste Automatizado ${Date.now()}`,
      description: 'Descrição de teste para validação de endpoints e regras de negócio.',
      category: 'Tecnologia',
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      locationType: 'online',
      location: 'https://meet.google.com/test-event',
      maxCapacity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    };

    const res = await fetchWithTimeout(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) return { ok: false, details: `Status esperado 201 Created, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!data?.id) return { ok: false, details: 'Objeto retornado não contém o campo "id"' };
    sharedEventId = String(data.id);
    return { ok: true, details: `Evento criado com ID ${sharedEventId}` };
  });

  // 6. POST /api/events (Validação de campos ausentes -> 400)
  await runTest('6. POST /api/events (Validação de Erro 400 Bad Request)', 0.5, async () => {
    const invalidPayload = { title: '' };
    const res = await fetchWithTimeout(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    if (res.status !== 400) {
      return { ok: false, details: `Esperado 400 Bad Request para dados inválidos, recebido ${res.status}` };
    }
    return { ok: true, details: 'Retornou 400 corretamente' };
  });

  // 7. GET /api/events/:id
  await runTest('7. GET /api/events/:id (Buscar Detalhes por ID)', 0.5, async () => {
    if (!sharedEventId) return { ok: false, details: 'Evento não foi criado no teste 5' };
    const res = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}`);
    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (data?.id != sharedEventId) return { ok: false, details: 'ID retornado diverge do solicitado' };
    return { ok: true, details: 'Detalhes do evento retornados com sucesso' };
  });

  // 8. GET /api/events/id_inexistente (404)
  await runTest('8. GET /api/events/:id (Tratamento de 404 Not Found)', 0.5, async () => {
    const res = await fetchWithTimeout(`${baseUrl}/api/events/id_totalmente_inexistente_${Date.now()}`);
    if (res.status !== 404) {
      return { ok: false, details: `Esperado 404 Not Found para evento inexistente, recebido ${res.status}` };
    }
    return { ok: true, details: 'Retornou 404 Not Found corretamente' };
  });

  // 9. POST /api/events/:id/attendees (Inscrição de Participante)
  await runTest('9. POST /api/events/:id/attendees (Inscrição de Participante)', 1.0, async () => {
    if (!sharedEventId) return { ok: false, details: 'Evento não foi criado no teste 5' };
    const attendeePayload = {
      name: 'Dev Tester',
      email: `dev.tester.${Date.now()}@exemplo.com`,
    };

    const res = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendeePayload),
    });

    if (res.status !== 201) return { ok: false, details: `Status esperado 201 Created, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!data?.id) return { ok: false, details: 'Objeto de inscrição não contém "id"' };
    sharedAttendeeId = String(data.id);
    return { ok: true, details: `Inscrição criada com ID ${sharedAttendeeId}` };
  });

  // 10. Regra de E-mail Duplicado (409 Conflict)
  await runTest('10. POST /api/events/:id/attendees (Regra de E-mail Único 409)', 1.5, async () => {
    if (!sharedEventId) return { ok: false, details: 'Evento não foi criado no teste 5' };
    const duplicateEmail = `duplicado.${Date.now()}@exemplo.com`;

    // Primeira inscrição (deve ter sucesso)
    const firstRes = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Primeira Inscrição', email: duplicateEmail }),
    });

    if (firstRes.status !== 201) {
      return { ok: false, details: `Falha ao criar primeira inscrição preparatória (${firstRes.status})` };
    }

    // Segunda inscrição com mesmo e-mail no mesmo evento (deve retornar 409 Conflict)
    const secondRes = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Segunda Inscrição', email: duplicateEmail }),
    });

    if (secondRes.status !== 409) {
      return {
        ok: false,
        details: `Esperado status 409 Conflict para e-mail repetido, recebido ${secondRes.status}`,
      };
    }
    return { ok: true, details: 'Retornou 409 Conflict corretamente' };
  });

  // 11. Regra de Capacidade Máxima / Lotação (400 Bad Request)
  await runTest('11. POST /api/events/:id/attendees (Regra de Lotação Máxima 400)', 1.5, async () => {
    // Cria um evento exclusivo com maxCapacity = 1
    const capRes = await fetchWithTimeout(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Evento Lotação ${Date.now()}`,
        description: 'Evento com apenas 1 vaga para testar esgotamento.',
        category: 'Geral',
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
        locationType: 'online',
        location: 'https://meet.google.com/test-cap',
        maxCapacity: 1,
      }),
    });

    if (capRes.status !== 201) {
      return { ok: false, details: 'Falha ao criar evento preparatório com maxCapacity = 1' };
    }
    const capEvent = await capRes.json().catch(() => null);
    sharedCapacityEventId = String(capEvent.id);

    // Preenche a única vaga (deve ser 201)
    const fillRes = await fetchWithTimeout(`${baseUrl}/api/events/${sharedCapacityEventId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ocupante da Vaga', email: `vaga.${Date.now()}@teste.com` }),
    });

    if (fillRes.status !== 201) {
      return { ok: false, details: `Falha ao registrar primeira vaga (${fillRes.status})` };
    }

    // Tenta registrar mais um participante além da capacidade (deve retornar 400 Bad Request)
    const overRes = await fetchWithTimeout(`${baseUrl}/api/events/${sharedCapacityEventId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Excedente', email: `excedente.${Date.now()}@teste.com` }),
    });

    if (overRes.status !== 400) {
      return {
        ok: false,
        details: `Esperado 400 Bad Request para evento lotado, recebido ${overRes.status}`,
      };
    }
    return { ok: true, details: 'Bloqueou inscrição excedente com 400 Bad Request' };
  });

  // 12. GET /api/events/:id/attendees
  await runTest('12. GET /api/events/:id/attendees (Listagem de Inscritos)', 0.5, async () => {
    if (!sharedEventId) return { ok: false, details: 'Evento não foi criado no teste 5' };
    const res = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}/attendees`);
    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    const data = await res.json().catch(() => null);
    if (!Array.isArray(data)) return { ok: false, details: 'Resposta deve ser um array de inscritos' };
    return { ok: true, details: `Listou ${data.length} inscritos` };
  });

  // 13. DELETE /api/events/:id/attendees/:attendeeId
  await runTest('13. DELETE /api/events/:id/attendees/:id (Cancelar Inscrição)', 0.5, async () => {
    if (!sharedEventId || !sharedAttendeeId) return { ok: false, details: 'Inscrição não disponível' };
    const res = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}/attendees/${sharedAttendeeId}`, {
      method: 'DELETE',
    });

    if (res.status !== 204 && res.status !== 200) {
      return { ok: false, details: `Esperado 204 No Content ou 200 OK, recebido ${res.status}` };
    }
    return { ok: true, details: 'Cancelamento efetuado com sucesso' };
  });

  // 14. PUT /api/events/:id
  await runTest('14. PUT /api/events/:id (Atualização de Dados do Evento)', 0.5, async () => {
    if (!sharedEventId) return { ok: false, details: 'Evento não disponível' };
    const updatePayload = {
      title: 'Título do Evento Atualizado via PUT',
      maxCapacity: 80,
    };

    const res = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });

    if (res.status !== 200) return { ok: false, details: `Status esperado 200, recebido ${res.status}` };
    return { ok: true, details: 'Evento atualizado com sucesso' };
  });

  // 15. DELETE /api/events/:id
  await runTest('15. DELETE /api/events/:id (Exclusão de Evento)', 0.5, async () => {
    if (!sharedEventId) return { ok: false, details: 'Evento não disponível' };
    const res = await fetchWithTimeout(`${baseUrl}/api/events/${sharedEventId}`, {
      method: 'DELETE',
    });

    if (res.status !== 204 && res.status !== 200) {
      return { ok: false, details: `Esperado 204 No Content ou 200 OK, recebido ${res.status}` };
    }

    // Limpa também o evento preparatório de lotação
    if (sharedCapacityEventId) {
      await fetchWithTimeout(`${baseUrl}/api/events/${sharedCapacityEventId}`, { method: 'DELETE' }).catch(() => {});
    }

    return { ok: true, details: 'Evento excluído com sucesso' };
  });

  // ==========================================
  // RELATÓRIO FINAL E CÁLCULO DA NOTA
  // ==========================================
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const passedCount = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const roundedScore = Math.min(10.0, Math.round(totalScore * 10) / 10);

  console.log(`\n${colors.bright}===============================================================${colors.reset}`);
  console.log(`                 📊 RELATÓRIO DE AVALIAÇÃO DA API               `);
  console.log(`${colors.bright}===============================================================${colors.reset}\n`);

  console.log(`  • Testes executados: ${totalTests}`);
  console.log(`  • Testes aprovados:  ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  • Testes reprovados: ${totalTests - passedCount > 0 ? colors.red : colors.green}${totalTests - passedCount}${colors.reset}`);

  // Classificação da Nota
  let gradeColor = colors.red;
  let gradeText = 'INSUFICIENTE';
  if (roundedScore >= 9.0) {
    gradeColor = colors.green;
    gradeText = 'EXCELENTE (PARABÉNS!)';
  } else if (roundedScore >= 7.0) {
    gradeColor = colors.green;
    gradeText = 'BOM / APROVADO';
  } else if (roundedScore >= 5.0) {
    gradeColor = colors.yellow;
    gradeText = 'REGULAR (REGRAS IMPORTANTES PENDENTES)';
  }

  console.log(`\n  ${colors.bright}NOTA FINAL:${colors.reset} ${gradeColor}${colors.bright}${roundedScore.toFixed(1)} / 10.0${colors.reset}  (${gradeColor}${gradeText}${colors.reset})\n`);

  // Detalhamento de falhas
  const failedTests = results.filter((r) => !r.passed);
  if (failedTests.length > 0) {
    console.log(`${colors.yellow}⚠️  Pontos a corrigir na API:${colors.reset}`);
    failedTests.forEach((f) => {
      console.log(`   - ${colors.bright}${f.name}${colors.reset}`);
      if (f.details) console.log(`     ${colors.dim}Motivo: ${f.details}${colors.reset}`);
      if (f.error) console.log(`     ${colors.dim}Erro de conexão: ${f.error}${colors.reset}`);
    });
    console.log('');
  } else {
    console.log(`${colors.green}${colors.bright}🏆 Todos os endpoints e regras de negócio foram implementados com maestria!${colors.reset}\n`);
  }

  console.log(`${colors.bright}===============================================================${colors.reset}\n`);
}

runValidation().catch((err) => {
  console.error('\nErro inesperado ao executar validação:', err);
  process.exit(1);
});
