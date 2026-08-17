// @ts-check


/**
 * 1000 - 1999 => Lexing errors  
 * 2000 - 2999 => Parsing errors  
 * 3000 - 3999 => Resolving errors  
 * 4000 - 4999 => Execution errors  
 * 5000 - 5999 => Implementation errors  
 * 6000 - 6999 => CLI errors  
 * 
 * @type {Record<string, DiagnosticDefinition>}
 */
export const messages = {
    UnterminatedString: {
        code: 1000,
        type: "error",
        template: "Unterminated string literal."
    },
    UnexpectedCharacter: {
        code: 1001,
        type: "error",
        template: `Unexpected character "{0}".`
    },
    InvalidNumericLiteral: {
        code: 1002,
        type: "error",
        template: "Invalid numeric literal."
    },


    ExpectedToken: {
        code: 2000,
        type: "error",
        template: "'{0}' expected."
    },
    UnexpectedToken: {
        code: 2001,
        type: "error",
        template: "Unexpected token."
    },
    ExpressionExpected: {
        code: 2002,
        type: "error",
        template: "Expression expected."
    },
    StatementExpected: {
        code: 2003,
        type: "error",
        template: "Statement expected."
    },

}