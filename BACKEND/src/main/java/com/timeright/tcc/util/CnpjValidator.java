package com.timeright.tcc.util;

public class CnpjValidator {

    private CnpjValidator() {}

    /**
     * Valida um CNPJ aceitando os formatos:
     *   - apenas dígitos:  "11222333000181"
     *   - com máscara:     "11.222.333/0001-81"
     *
     * Retorna {@code true} se o CNPJ for válido.
     */
    public static boolean isValid(String cnpj) {
        if (cnpj == null) return false;

        String digits = cnpj.replaceAll("[.\\-/]", "");

        if (digits.length() != 14 || !digits.matches("\\d{14}")) return false;

        // Rejeita sequências com todos os dígitos iguais (ex: "00000000000000")
        if (digits.chars().distinct().count() == 1) return false;

        return calcDigit(digits, 12) == Character.getNumericValue(digits.charAt(12))
            && calcDigit(digits, 13) == Character.getNumericValue(digits.charAt(13));
    }

    /** Calcula um dígito verificador para os primeiros {@code length} dígitos. */
    private static int calcDigit(String digits, int length) {
        int[] weights = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        int offset = weights.length - length;
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * weights[offset + i];
        }
        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
