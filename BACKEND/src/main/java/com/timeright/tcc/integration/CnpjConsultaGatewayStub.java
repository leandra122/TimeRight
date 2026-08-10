package com.timeright.tcc.integration;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.timeright.tcc.util.CnpjValidator;

/**
 * Implementação padrão (stub) do gateway de consulta de CNPJ.
 *
 * Não realiza chamada a serviço externo. Valida o CNPJ localmente e
 * retorna um resultado com os campos de razão social e nome fantasia
 * em branco, prontos para serem preenchidos pelo usuário no cadastro.
 *
 * Substitua esta classe por uma implementação real quando disponível:
 *
 *   @Service
 *   @Primary
 *   public class BrasilApiCnpjGateway implements CnpjConsultaGateway { ... }
 */
@Component
@Primary
public class CnpjConsultaGatewayStub implements CnpjConsultaGateway {

    @Override
    public CnpjConsultaResultado consultar(String cnpj) {
        if (!CnpjValidator.isValid(cnpj))
            throw new CnpjConsultaException("CNPJ inválido: " + cnpj);

        String digits = cnpj.replaceAll("[.\\-/]", "");

        return new CnpjConsultaResultado(
            digits,
            null,   // razão social: preenchida pelo usuário ou por serviço externo
            null,   // nome fantasia: idem
            "ATIVA" // situação padrão enquanto não há integração real
        );
    }
}
