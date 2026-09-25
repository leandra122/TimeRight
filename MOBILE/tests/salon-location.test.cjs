const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let maps;
before(async () => {
  const source = fs.readFileSync(path.join(__dirname,'../src/utils/salonLocation.js'),'utf8');
  maps = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
});
const salon = { logradouro:'Rua São José', numero:'42', bairro:'Centro', cidade:'São Paulo', uf:'SP', cep:'01000-000', endereco:'Endereço legado' };
test('endereço e coordenadas priorizam o endereço completo cadastrado',()=>{
  const url = new URL(maps.googleMapsUrl(salon,{status:'FOUND',latitude:-23.55,longitude:-46.63}));
  assert.equal(url.origin,'https://www.google.com');assert.equal(url.searchParams.get('api'),'1');assert.equal(url.searchParams.get('query'),'Rua São José, 42, Centro, São Paulo, SP, 01000-000');
});
test('somente coordenadas usa o resultado da API sem alterá-lo',()=>{
  const result = Object.freeze({status:'FOUND',latitude:-23.55,longitude:-46.63});
  for (const address of [{}, {logradouro:'Rua Teste',cidade:'São Paulo'}, {endereco:'  '}]) {
    assert.equal(new URL(maps.googleMapsUrl(address,result)).searchParams.get('query'),'-23.55,-46.63');
  }
  assert.deepEqual(result,{status:'FOUND',latitude:-23.55,longitude:-46.63});
});
test('sem endereço nem coordenadas não gera link',()=>{
  assert.equal(maps.googleMapsUrl({},null),null);
  assert.equal(maps.googleMapsUrl({},{status:'INCOMPLETE'}),null);
});
test('endereço legado também tem prioridade sobre coordenadas',()=>{
  assert.equal(new URL(maps.googleMapsUrl({endereco:'Rua Teste, 10, São Paulo - SP'},{status:'FOUND',latitude:-23.55,longitude:-46.63})).searchParams.get('query'),'Rua Teste, 10, São Paulo - SP');
});
test('endereço estruturado inclui número, cidade, UF e caracteres escapados',()=>{
  const url=new URL(maps.googleMapsUrl({...salon,logradouro:'Rua São José & João #1'},null));
  assert.equal(url.searchParams.get('query'),'Rua São José & João #1, 42, Centro, São Paulo, SP, 01000-000');assert.equal(url.hash,'');assert.equal([...url.searchParams].length,2);
});
test('falha de geocodificação permite busca pelo endereço',()=>{
  for(const status of ['NOT_FOUND','UNAVAILABLE','INCOMPLETE']) assert.equal(new URL(maps.googleMapsUrl(salon,{status,latitude:1,longitude:2})).searchParams.get('query'),maps.salonAddress(salon));
});
test('endereço legado é preservado',()=>{assert.equal(new URL(maps.googleMapsUrl({endereco:'Rua Teste, 10, São Paulo - SP'},null)).searchParams.get('query'),'Rua Teste, 10, São Paulo - SP');});
test('coordenadas ausentes, inválidas ou fora dos limites não criam marcador',()=>{
  for(const [latitude,longitude] of [[null,null],['',''],[false,true],[NaN,1],[Infinity,0],[91,0],[0,181],['-23','-46']]) {
    assert.equal(maps.locationCoordinates({status:'FOUND',latitude,longitude}),null);
    assert.equal(maps.googleMapsUrl({}, {status:'FOUND',latitude,longitude}),null);
  }
});
test('zero é aceito somente quando é uma coordenada numérica real retornada',()=>{assert.deepEqual(maps.locationCoordinates({status:'FOUND',latitude:0,longitude:0}),{latitude:0,longitude:0});});
test('cidade, nome ou CEP isolados não geram busca ambígua',()=>{assert.equal(maps.googleMapsUrl({nome:'Salão',cidade:'São Paulo',uf:'SP',cep:'01000-000'},null),null);assert.equal(maps.googleMapsUrl({endereco:'  '},null),null);});
