// Execute após npm run build. Requer Chrome e Playwright disponível em PLAYWRIGHT_MODULE.
// Toda chamada de API é interceptada: não usa Backend nem banco reais.
// node tests/home-cadastro.browser.cjs
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


(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let passed = 0;
  async function test(name, run, tipo = null) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const state = { status: 200, duplicate: false, saveConflict: false, saves: 0, statsHeaders: [] };
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(tipo => {
      if (tipo && !sessionStorage.getItem('seeded')) {
        localStorage.setItem('token', 'fixture');
        localStorage.setItem('usuario', tipo === 'corrupt' ? '{invalid' : JSON.stringify({ nome: 'Teste', tipo }));
        sessionStorage.setItem('seeded', '1');
      }
    }, tipo);
    await page.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.origin === base) return route.continue();
      if (['stylesheet','font'].includes(req.resourceType())) return route.fulfill({body:''});
      if (req.method() === 'OPTIONS') return json(route, {});
      if (url.pathname === '/saloes/me' && state.delayPrivate) {
        state.delayPrivate=false;
        return new Promise(resolve => { state.release = async () => { await json(route,{error:'Sessão expirada'},401); resolve(); }; });
      }
      if (url.pathname === '/api/auth/login') return json(route, {token:'new-token',role:state.role || 'MANAGER', userId:1,nome:'Teste'});
      if (url.pathname === '/dashboard/stats/plataforma') {
        state.statsHeaders.push(req.headers());
        return json(route, {totalAgendamentos:1,totalSaloes:1,totalAvaliacoes:0}, state.status);
      }
      if (url.pathname.startsWith('/saloes/cnpj/')) return json(route, state.duplicate ? {error:'Este CNPJ já está cadastrado no TimeRight.'} : {cnpj:'11222333000181',situacaoCadastral:null}, state.duplicate ? 409 : 200);
      if (url.pathname === '/saloes/com-servicos') {state.saves++; return json(route, state.saveConflict ? {error:'Este CNPJ já está cadastrado no TimeRight.'} : {data:{id:1}}, state.saveConflict ? 409 : 201);}
      if (url.pathname === '/saloes/1') return json(route,{id:1,nome:'Salão teste',status:'ATIVO'});
      if (url.pathname === '/dashboard/stats') return json(route,{});
      return json(route,[],state.privateStatus || 200);
    });
    try {await run(page,state); assert.deepEqual(errors,[]); console.log('PASS: '+name); passed++;}
    finally {await context.close();}
  }
  const home = async page => { await page.locator('h1.hero-title').waitFor(); assert.equal(new URL(page.url()).pathname,'/'); };
  try {
    await test('Home pública e logo sem sessão, inclusive 401 público',async (page,state)=>{
      state.status=401; await page.goto(base); await home(page);
      await until(()=>state.statsHeaders.length>0);
      await page.goto(base+'/login'); await page.locator('.navbar-logo').click(); await home(page);
    });
    await test('Home e logo com sessão não enviam token nas estatísticas',async(page,state)=>{
      await page.goto(base); await home(page); await until(()=>state.statsHeaders.length>0);
      assert.equal(state.statsHeaders[0].authorization,undefined);
      await page.goto(base+'/manager'); await page.locator('.navbar-logo').click(); await home(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('token')),'fixture');
    },'manager');
    await test('logout retorna à Home e limpa sessão',async page=>{
      await page.goto(base); await page.locator('button[title="Sair"]').click(); await home(page);
      await until(()=>page.evaluate(()=>localStorage.getItem('token')===null));
      await page.goto(base+'/manager'); await page.waitForURL('**/login');
    },'manager');
    await test('rota privada sem sessão',async page=>{await page.goto(base+'/manager');await page.waitForURL('**/login');});
    await test('sessão local corrompida não quebra Home',async page=>{await page.goto(base);await home(page);},'corrupt');
    await test('401 privado limpa sessão sem loop',async(page,state)=>{
      state.privateStatus=401; await page.goto(base+'/manager');await page.waitForURL('**/login');
      await until(()=>page.evaluate(()=>localStorage.getItem('token')===null));
      await page.locator('.navbar-logo').click(); await home(page);
    },'manager');
    await test('403 não encerra sessão',async(page,state)=>{
      state.privateStatus=403; await page.goto(base+'/manager'); await page.locator('.navbar-logo').click(); await home(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('token')),'fixture');
    },'manager');
    await test('401 pendente recebido na Home limpa sessão sem redirecionar',async(page,state)=>{
      state.delayPrivate=true;await page.goto(base+'/manager');await until(()=>!!state.release);
      await page.locator('.navbar-logo').click();await home(page);await state.release();
      await until(()=>page.evaluate(()=>localStorage.getItem('token')===null));await home(page);
    },'manager');
    await test('401 de sessão antiga não encerra novo login',async(page,state)=>{
      state.delayPrivate=true;await page.goto(base+'/manager');await until(()=>!!state.release);
      await page.locator('.navbar-logo').click();await home(page);
      await page.getByRole('link',{name:'Conhecer serviços'}).click();
      await page.locator('[name="username"]').fill('teste@example.com');await page.locator('[name="senha"]').fill('senha');
      await page.locator('button[type="submit"]').click();await page.waitForURL(url=>url.pathname==='/manager');
      await until(()=>page.evaluate(()=>localStorage.getItem('token')==='new-token'));
      const response = page.waitForResponse(r=>r.url().endsWith('/saloes/me') && r.status()===401);
      await state.release();await response;
      await page.locator('.navbar-logo').click();await home(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('token')),'new-token');
    },'manager');
    for (const [role,dest] of [['MANAGER','/manager'],['ADMIN','/admin'],['EMPLOYEE','/employee/agenda']]) {
      await test('login '+role,async(page,state)=>{
        state.role=role;await page.goto(base+'/login');await page.locator('[name="username"]').fill('teste@example.com');
        await page.locator('[name="senha"]').fill('senha');await page.locator('button[type="submit"]').click();
        await page.waitForURL(url=>url.pathname===dest);await until(()=>page.evaluate(()=>localStorage.getItem('token')==='new-token'));
      });
    }
    async function fill(page) {
      await page.goto(base+'/manager/cadastro-salao');
      await page.locator('[name="cnpj"]').fill('11222333000181');
      await page.getByText('Formato e dígitos verificadores válidos.',{exact:false}).waitFor();
      for (const [name,value] of Object.entries({nome:'Salão teste',email:'teste@example.com',telefone:'11999999999',logradouro:'Rua teste',numero:'1',bairro:'Centro',cidade:'São Paulo',uf:'SP',razaoSocial:'Teste Ltda',nomeFantasia:'Teste'})) {
        const input=page.locator('[name="'+name+'"]');if(await input.count()) await input.fill(value);
      }
    }
    await test('CNPJ duplicado na verificação antecipada',async(page,state)=>{
      state.duplicate=true;await page.goto(base+'/manager/cadastro-salao');await page.locator('[name="cnpj"]').fill('11222333000181');
      await page.getByText('Este CNPJ já está cadastrado no TimeRight.').waitFor();assert.equal(state.saves,0);
    },'manager');
    await test('CNPJ duplicado no envio mostra conflito e preserva formulário',async(page,state)=>{
      state.saveConflict=true;await fill(page);await page.locator('button[type="submit"]').click();
      await page.getByRole('alert').filter({hasText:'Este CNPJ já está cadastrado no TimeRight.'}).waitFor();
      assert.equal(state.saves,1);assert.equal(await page.locator('[name="nome"]').inputValue(),'Salão teste');
    },'manager');
    await test('cadastro válido navega para salão criado',async(page,state)=>{
      await fill(page);await page.locator('button[type="submit"]').click();await page.waitForURL('**/manager/saloes/1');assert.equal(state.saves,1);
    },'manager');
    console.log(passed+' testes passaram');
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
