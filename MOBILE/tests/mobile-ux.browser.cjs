// Execute após npm run export:web. Requer Chrome e Playwright disponível em PLAYWRIGHT_MODULE.
// Toda chamada de API é interceptada: não usa Backend nem banco reais.
// node tests/mobile-ux.browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = process.env.MOBILE_WEB_DIST || path.resolve(__dirname, '../dist');
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



(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:'chrome',headless:true});
  let passed=0;
  async function test(name,run,patch={}) {
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();page.setDefaultTimeout(20000);
    const salon={id:1,nome:'Salão Teste',status:'ATIVO',logradouro:'Rua São José',numero:'42',cidade:'São Paulo',uf:'SP',endereco:'Rua São José, 42, São Paulo - SP',...patch};
    const service={id:2,nome:'Corte Teste',status:'ATIVO',preco:40,duracao:30};
    const employee={id:3,nome:'Profissional Teste',status:'ATIVO'};
    const state={location:{status:'FOUND',latitude:-23.55,longitude:-46.63,enderecoEncontrado:salon.endereco},locationStatus:200,creates:[],cancels:0,slots:['10:00:00','11:00:00'],createStatus:201,availabilityStatus:200};
    let appointment;const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      if (window.top !== window) return;
      localStorage.setItem('timeright.session',JSON.stringify({token:'fixture',expiresAt:Date.now()+3600000,user:{id:1,nome:'Cliente',role:'USER'}}));
      window.mapCalls=[];window.open=(url)=>{window.mapCalls.push(url);return {};};
    });
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin===base)return route.continue();
      if(url.hostname==='www.openstreetmap.org')return route.fulfill({contentType:'text/html',body:'<p>Mapa simulado</p>'});
      if(request.method()==='OPTIONS')return json(route,{});
      if(url.pathname==='/saloes')return json(route,[salon]);
      if(url.pathname==='/saloes/1')return json(route,salon);
      if(url.pathname==='/saloes/1/fotos')return json(route,[]);
      if(url.pathname==='/saloes/1/localizacao')return json(route,state.location,state.locationStatus);
      if(url.pathname==='/servicos/salao/1')return json(route,[service]);
      if(url.pathname==='/catalogo/saloes/1/funcionarios')return json(route,[employee]);
      if(url.pathname==='/api/client/disponibilidade')return json(route,{horarios:state.slots},state.availabilityStatus);
      if(url.pathname==='/api/client/agendamentos' && request.method()==='POST') {
        const payload=request.postDataJSON();state.creates.push(payload);
        appointment={id:10,salao:salon,servico:service,funcionario:employee,dataHora:payload.dataHora,duracao:30,status:'CONFIRMADO',observacoes:null};
        return json(route,state.createStatus===409?{error:'Horário indisponível'}:appointment,state.createStatus);
      }
      if(url.pathname==='/api/client/agendamentos/10/cancelar') {state.cancels++;return json(route,{...appointment,status:'CANCELADO'});}
      if(url.pathname==='/api/client/agendamentos')return json(route,appointment?[appointment]:[]);
      errors.push('API inesperada: '+url.pathname);return json(route,{},404);
    });
    try{await run(page,state);assert.deepEqual(errors,[]);console.log('PASS: '+name);passed++;}finally{await context.close();}
  }
  async function openSalon(page){await page.goto(base);await page.getByRole('button').filter({hasText:'Salão Teste'}).click();await page.getByText('1. Escolha o serviço',{exact:true}).waitFor();}
  async function newAppointment(page){await openSalon(page);await page.getByRole('button').filter({hasText:'Corte Teste'}).click();await page.getByRole('button').filter({hasText:'Profissional Teste'}).click();await page.getByRole('button',{name:/Continuar para data e horário/}).click();await page.getByRole('button',{name:'Selecionar horário 10:00',exact:true}).waitFor();}
  try{
    await test('mapa existente preservado e Google Maps prioriza endereço sobre coordenadas',async page=>{
      await openSalon(page);await page.locator('iframe').waitFor();
      assert.ok((await page.locator('iframe').getAttribute('src')).includes('marker=-23.55,-46.63'));
      await page.getByRole('button',{name:/Abrir no Google Maps/}).click();
      assert.equal(new URL((await page.evaluate(()=>window.mapCalls))[0]).searchParams.get('query'),'Rua São José, 42, São Paulo, SP');
    });
    await test('somente coordenadas preserva mapa e usa fallback no Google Maps',async page=>{
      await openSalon(page);await page.locator('iframe').waitFor();
      assert.ok((await page.locator('iframe').getAttribute('src')).includes('marker=-23.55,-46.63'));
      await page.getByRole('button',{name:/Abrir no Google Maps/}).click();
      assert.equal(new URL((await page.evaluate(()=>window.mapCalls))[0]).searchParams.get('query'),'-23.55,-46.63');
    },{logradouro:null,numero:null,cidade:null,uf:null,endereco:null});
    await test('falha de localização usa endereço real',async(page,state)=>{
      state.locationStatus=503;await openSalon(page);await page.getByText('Localização temporariamente indisponível.',{exact:true}).waitFor();
      await page.getByRole('button',{name:/Abrir no Google Maps/}).click();assert.equal(new URL((await page.evaluate(()=>window.mapCalls))[0]).searchParams.get('query'),'Rua São José, 42, São Paulo, SP');assert.equal(await page.locator('iframe').count(),0);
    });
    await test('sem localização suficiente não oferece link inválido',async(page,state)=>{
      state.location={status:'INCOMPLETE'};await openSalon(page);await page.getByText(/Não há localização suficiente/).waitFor();assert.equal(await page.getByRole('button',{name:/Abrir no Google Maps/}).count(),0);
    },{logradouro:null,numero:null,cidade:null,uf:null,endereco:null});
    await test('erro ao abrir Google Maps permite nova tentativa',async page=>{
      await openSalon(page);await page.evaluate(()=>{window.open=()=>{throw Error('Bloqueado');};});
      await page.getByRole('button',{name:/Abrir no Google Maps/}).click();await page.getByRole('alert').waitFor();
      await page.evaluate(()=>{window.open=url=>{window.mapCalls.push(url);return {};};});
      await page.getByRole('button',{name:/Abrir no Google Maps/}).click();await until(async()=>await page.getByRole('alert').count()===0);
    });
    await test('criação sem observações, confirmação e cancelamento preservados',async(page,state)=>{
      await newAppointment(page);assert.equal(await page.getByLabel('Observações (opcional)').count(),0);assert.equal(await page.locator('textarea').count(),0);
      await page.getByRole('button',{name:'Selecionar horário 10:00',exact:true}).click();await page.getByRole('button',{name:/Confirmar agendamento/}).click();
      await page.getByRole('button',{name:/Visualizar agendamento/}).waitFor();assert.equal(state.creates.length,1);
      assert.deepEqual(Object.keys(state.creates[0]).sort(),['dataHora','funcionarioId','observacoes','servicoId']);assert.equal(state.creates[0].observacoes,null);assert.equal(state.creates[0].funcionarioId,3);assert.equal(state.creates[0].servicoId,2);
      await page.getByRole('button',{name:/Visualizar agendamento/}).click();page.on('dialog',dialog=>dialog.accept());
      await page.getByRole('button',{name:/Cancelar agendamento/}).click();await page.getByText('Agendamento cancelado. O registro foi mantido no seu histórico.',{exact:true}).waitFor();assert.equal(state.cancels,1);
    });
    await test('conflito de horário mantém criação sem observações e permite tentar outro',async(page,state)=>{
      state.createStatus=409;await newAppointment(page);await page.getByRole('button',{name:'Selecionar horário 10:00',exact:true}).click();
      await page.getByRole('button',{name:/Confirmar agendamento/}).click();await until(()=>state.creates.length===1);
      await page.getByRole('button',{name:'Selecionar horário 11:00',exact:true}).click();state.createStatus=201;
      await page.getByRole('button',{name:/Confirmar agendamento/}).click();await page.getByRole('button',{name:/Visualizar agendamento/}).waitFor();
      assert.equal(state.creates.length,2);assert.equal(state.creates[1].observacoes,null);assert.ok(state.creates[1].dataHora.endsWith('T11:00:00'));
    });
    await test('sem horários disponíveis não permite confirmar',async(page,state)=>{
      state.slots=[];await openSalon(page);await page.getByRole('button').filter({hasText:'Corte Teste'}).click();await page.getByRole('button').filter({hasText:'Profissional Teste'}).click();
      await page.getByRole('button',{name:/Continuar para data e horário/}).click();await page.getByText('Nenhum horário disponível para esta data',{exact:true}).waitFor();
      assert.equal(await page.getByRole('button',{name:/Confirmar agendamento/}).isDisabled(),true);assert.equal(state.creates.length,0);
    });
    console.log(passed+' cenários passaram; API e mapas externos simulados.');
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
