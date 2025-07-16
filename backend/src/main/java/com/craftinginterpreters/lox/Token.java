package com.craftinginterpreters.lox;

public class Token {
    final TokenType tokenType;      // kind of token (e.g. PLUS, EQUAL)
    final String lexeme;            // the actual text of the token from source
    final Object literal;           // any literal value (e.g. 123, "abc")
    final int line;                 // line number from source code [location]

    public Token(TokenType tokenType, String lexeme, Object literal, int line) {
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    @Override
    public String toString() {
        return "Token{" +
                "tokenType=" + tokenType +
                ", lexeme='" + lexeme + '\'' +
                ", literal=" + literal +
                ", line=" + line +
                '}';
    }

    /*@Override
    public String toString() {
        return tokenType + " " + lexeme + " " + literal;
    }*/
}
