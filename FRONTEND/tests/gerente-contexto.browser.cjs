// Execute após npm run build. Requer Chrome e Playwright disponível em PLAYWRIGHT_MODULE.
// Toda chamada de API é interceptada: não usa Backend nem banco reais.
// node tests/gerente-contexto.browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '../dist');
const server = http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

const json = (route, data, status = 200) => route.fulfill({
  status, contentType: 'application/json', body: JSON.stringify(data),
  headers: { 'Access-Control-Allow-Origin': '*' },
});
async function until(check) {
  const deadline = Date.now() + 8000;
  while (!await check()) {
    if (Date.now() > deadline) throw new Error('Condição não atingida no prazo');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

async function fixture(browser, base, run) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fixture');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Gerente teste', tipo: 'manager' }));
  });
  const salons = [1, 2].map(id => ({ id, nome: `Salao ${id}`, status: 'ATIVO',
    endereco: `Rua ${id}, 10`, logradouro: `Rua ${id}`, numero: '10', email: 'teste@example.com', telefone: '123' }));
  const services = [1, 2, 3].map(id => ({ id, nome: `Servico ${id}`, status: 'ATIVO', duracao: 30, preco: 40, salao: salons[id === 3 ? 1 : 0] }));
  const employees = [1, 2, 3].map(id => ({ id, nome: `Pessoa ${id}`, status: 'ATIVO', funcao: 'Corte', email: `p${id}@example.com`, salao: salons[id === 3 ? 1 : 0] }));
  const calls = [], errors = [];
  const state = { handler: null, salons, services, employees, calls };
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === base) return route.continue();
    if (['stylesheet', 'font'].includes(request.resourceType())) return route.fulfill({ body: '' });
    const call = { path: url.pathname, method: request.method(), body: request.postData() ? request.postDataJSON() : null };
    calls.push(call);
    if (state.handler && await state.handler(route, call)) return;
    let data;
    if (call.path === '/saloes/me' || call.path === '/saloes') data = salons;
    else if (/^\/dashboard\/stats\/salao\/\d+$/.test(call.path)) data = { agendamentosHoje: Number(call.path.split('/').at(-1)) * 111 };
    else if (call.path === '/dashboard/stats') data = {};
    else if (call.path === '/funcionarios/me') data = employees;
    else if (call.path === '/servicos/me') data = services;
    else if (/^\/servicos\/salao\/\d+$/.test(call.path)) data = services.filter(s => s.salao.id === Number(call.path.split('/').at(-1)));
    else if (/^\/saloes\/\d+\/fotos$/.test(call.path)) data = [];
    else if (/^\/saloes\/\d+\/horarios-funcionamento$/.test(call.path)) data = { dias: Array.from({ length: 7 }, (_, i) => ({ diaSemana: i + 1, periodos: [] })) };
    else if (/^\/funcionarios\/\d+\/servicos$/.test(call.path)) data = { servicos: [services[Number(call.path.split('/')[2]) - 1]] };
    else if (/^\/saloes\/\d+$/.test(call.path) && call.method === 'PUT') {
      data = salons.find(s => s.id === Number(call.path.split('/')[2]));
      Object.assign(data, call.body);
    } else if (call.path === '/agendamentos/me') data = [];
    else {
      errors.push(`Chamada inesperada: ${call.method} ${call.path}`);
      return json(route, { error: 'Chamada inesperada no teste' }, 404);
    }
    await json(route, data);
  });
  try {
    await run(page, state);
    assert.deepEqual(errors, [], 'Nenhum erro de execução na página');
  } finally { await context.close(); }
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let passed = 0;
  async function test(name, run) {
    await fixture(browser, base, run);
    console.log(`PASS: ${name}`); passed++;
  }
  try {
    const pages = [
      ['/manager', '#salao-dashboard'], ['/manager/fotos', '#salao-fotos'],
      ['/manager/atualizar-salao', '#salao-edicao'], ['/manager/horarios', '#salao-horarios'],
      ['/manager/funcionarios', '#equipe-salao'], ['/manager/painel', 'select[aria-label="Filtrar por salão"]'],
    ];
    await test('salão na URL, troca, recarga e voltar nas seis páginas', async page => {
      for (const [url, selector] of pages) {
        await page.goto(base + url + '?salaoId=2&origem=teste');
        await until(async () => await page.locator(selector).count() && await page.locator(selector).inputValue() === '2');
        await page.locator(selector).selectOption('1');
        await until(() => new URL(page.url()).searchParams.get('salaoId') === '1');
        assert.equal(new URL(page.url()).searchParams.get('origem'), 'teste');
        await page.reload();
        await until(async () => await page.locator(selector).count() && await page.locator(selector).inputValue() === '1');
        await page.goBack();
        await until(async () => await page.locator(selector).count() && await page.locator(selector).inputValue() === '2');
      }
    });
    await test('seleção inicial explícita e opção Todos preservada', async page => {
      for (const [url, selector] of pages.slice(0, 4)) {
        await page.goto(base + url);
        await until(() => new URL(page.url()).searchParams.get('salaoId') === '1');
        await until(async () => await page.locator(selector).count() && await page.locator(selector).inputValue() === '1');
      }
      for (const [url, selector] of pages.slice(4)) {
        await page.goto(base + url + '?salaoId=2');
        await page.locator(selector).selectOption('');
        await page.reload();
        await until(async () => await page.locator(selector).count() && await page.locator(selector).inputValue() === '');
        assert.equal(new URL(page.url()).searchParams.has('salaoId'), false);
      }
    });
    await test('atalhos contextuais transportam o salão escolhido', async page => {
      for (const [url, selector] of pages.slice(1)) {
        await page.goto(base + '/manager?salaoId=2');
        const link = page.locator(`a[href="${url}?salaoId=2"]`);
        await link.click();
        await until(async () => await page.locator(selector).count() && await page.locator(selector).inputValue() === '2');
      }
      await page.goto(base + '/manager?salaoId=2');
      await page.locator('#salao-dashboard').waitFor();
      assert.equal(await page.locator('a[href="/manager/cadastro-salao"]').count(), 1);
    });
    await test('ID não autorizado não carrega dados nem oferece mutação contextual', async (page, state) => {
      for (const [url] of pages) {
        await page.goto(base + url + '?salaoId=999');
        await page.getByText(/Salão indisponível/).first().waitFor({ state: 'attached' });
        assert.equal(await page.locator('form').count(), 0);
        assert.equal(await page.locator('.cal-recursos').count(), 0);
      }
      assert.equal(state.calls.some(call => /\/999(?:\/|$)/.test(call.path)), false);
    });
    for (const oldStatus of [200, 500]) {
      await test(`estatística atrasada (${oldStatus}) não sobrescreve salão atual`, async (page, state) => {
        const pending = [];
        state.handler = (route, call) => {
          if (!call.path.startsWith('/dashboard/stats/salao/')) return false;
          pending.push({ route, id: call.path.split('/').at(-1) }); return true;
        };
        await page.goto(base + '/manager?salaoId=1');
        await until(() => pending.length === 1);
        await page.locator('#salao-dashboard').selectOption('2');
        await until(() => pending.length === 2);
        await json(pending[1].route, { agendamentosHoje: 222 });
        await until(async () => await page.locator('.stat-value').first().innerText() === '222');
        await json(pending[0].route, oldStatus === 200 ? { agendamentosHoje: 111 } : { error: 'Falha antiga' }, oldStatus);
        await page.waitForLoadState('networkidle');
        assert.equal(await page.locator('.stat-value').first().innerText(), '222');
        assert.equal(await page.getByRole('alert').count(), 0);
      });
    }
    await test('desativação indisponível não abre confirmação, não envia alteração e não mostra sucesso', async (page, state) => {
      for (const status of ['ATIVO', 'INATIVO']) {
        state.salons[1].status = status;
        await page.goto(base + '/manager?salaoId=2');
        await page.locator('#salao-dashboard').waitFor();
        const button = page.getByRole('button', { name: /Desativar Salão/ });
        assert.equal(await button.isDisabled(), true);
        await page.getByText('Indisponível: o fluxo de reativação ainda não está disponível.', { exact: true }).waitFor();
        await button.evaluate(element => element.click());
        await page.waitForLoadState('networkidle');
        assert.equal(await page.locator('.modal-overlay').count(), 0);
        assert.equal(await page.locator('.msg-sucesso').count(), 0);
      }
      assert.equal(state.calls.filter(call => !['GET', 'OPTIONS'].includes(call.method)).length, 0);
    });
    await test('voltar durante salvamento não deixa o seletor do outro salão bloqueado', async (page, state) => {
      let pending;
      state.handler = (route, call) => {
        if (call.method !== 'POST' || call.path !== '/servicos') return false;
        pending = route; return true;
      };
      await page.goto(base + '/manager?salaoId=2');
      await page.locator('#salao-dashboard').selectOption('1');
      await page.getByRole('button', { name: 'Novo serviço', exact: true }).click();
      await page.getByLabel('Nome', { exact: true }).fill('Novo corte');
      await page.getByLabel('Preço (R$)', { exact: true }).fill('40');
      await page.getByLabel('Duração (minutos)', { exact: true }).fill('30');
      await page.getByRole('button', { name: 'Salvar serviço', exact: true }).click();
      await until(() => !!pending);
      assert.equal(await page.locator('#salao-dashboard').isDisabled(), true);
      await page.goBack();
      await until(async () => await page.locator('#salao-dashboard').inputValue() === '2');
      assert.equal(await page.locator('#salao-dashboard').isEnabled(), true);
      await json(pending, { id: 4 });
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('#salao-dashboard').inputValue(), '2');
      assert.equal(await page.locator('.msg-sucesso').count(), 0);
    });
    for (const oldStatus of [200, 500]) {
      await test(`serviços antigos (${oldStatus}) não alteram outro funcionário nem o payload salvo`, async (page, state) => {
        const pending = []; let saving;
        state.handler = (route, call) => {
          if (!/^\/funcionarios\/\d+\/servicos$/.test(call.path)) return false;
          if (call.method === 'GET') pending.push({ route, call });
          else saving = { route, call };
          return true;
        };
        await page.goto(base + '/manager/funcionarios?salaoId=1');
        const open = page.getByTitle('Gerenciar serviços', { exact: true });
        await open.first().click();
        await until(() => pending.length === 1);
        await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
        await open.nth(1).click();
        await until(() => pending.length === 2);
        assert.equal(await page.getByRole('button', { name: 'Salvar alterações', exact: true }).isDisabled(), true);
        await json(pending[1].route, { servicos: [state.services[1]] });
        await page.getByLabel(/Servico 2/).waitFor();
        await json(pending[0].route, oldStatus === 200 ? { servicos: [state.services[0]] } : { error: 'Falha antiga' }, oldStatus);
        await page.waitForLoadState('networkidle');
        assert.equal(await page.locator('.modal-servicos-funcionario').innerText(), 'Pessoa 2');
        assert.equal(await page.getByLabel(/Servico 1/).isChecked(), false);
        assert.equal(await page.getByLabel(/Servico 2/).isChecked(), true);
        await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
        await until(() => !!saving);
        assert.equal(saving.call.path, '/funcionarios/2/servicos');
        assert.deepEqual(saving.call.body, { servicoIds: [2] });
        assert.equal(await page.getByRole('button', { name: 'Salvando...', exact: true }).isDisabled(), true);
        assert.equal(await page.getByLabel(/Servico 2/).isDisabled(), true);
        assert.equal(await page.getByRole('button', { name: 'Cancelar', exact: true }).isDisabled(), true);
        await json(saving.route, { servicos: [state.services[1]] });
        await page.locator('.modal-servicos').waitFor({ state: 'detached' });
        assert.equal(state.calls.filter(call => call.method === 'PUT').length, 1);
      });
    }
    console.log(`${passed} cenários passaram; nenhuma API real foi acessada.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
