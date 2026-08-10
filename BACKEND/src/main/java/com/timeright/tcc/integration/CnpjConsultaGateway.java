package com.timeright.tcc.integration;

/**
 * Contrato para consulta de dados de um CNPJ em fonte externa.
 *
 * Para integrar um serviço real (ex: ReceitaWS, BrasilAPI, Serpro):
 *   1. Crie uma nova classe que implemente esta interface.
 *   2. Anote-a com @Service e @Primary.
 *   3. Remova (ou mantenha como fallback) o CnpjConsultaGatewayStub.
 */
public interface CnpjConsultaGateway {

    /**
     * Consulta os dados cadastrais de um CNPJ.
     *
     * @param cnpj CNPJ com ou sem máscara
     * @return resultado com os dados encontrados
     * @throws CnpjConsultaException se o CNPJ não for encontrado ou o serviço estiver indisponível
     */
    CnpjConsultaResultado consultar(String cnpj);
}
