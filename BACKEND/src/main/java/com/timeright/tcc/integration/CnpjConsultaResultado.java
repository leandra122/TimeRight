package com.timeright.tcc.integration;

/**
 * Dados retornados pela consulta de CNPJ.
 * Campos opcionais ficam null quando o serviço não os fornece.
 */
public class CnpjConsultaResultado {

    private final String cnpj;
    private final String razaoSocial;
    private final String nomeFantasia;
    private final String situacaoCadastral;

    public CnpjConsultaResultado(String cnpj, String razaoSocial,
                                  String nomeFantasia, String situacaoCadastral) {
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
        this.nomeFantasia = nomeFantasia;
        this.situacaoCadastral = situacaoCadastral;
    }

    public String getCnpj()              { return cnpj; }
    public String getRazaoSocial()       { return razaoSocial; }
    public String getNomeFantasia()      { return nomeFantasia; }
    public String getSituacaoCadastral() { return situacaoCadastral; }
}
