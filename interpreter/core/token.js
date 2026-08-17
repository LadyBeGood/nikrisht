// @ts-check

/**
 * 
 * @param {Interpreter} interpreter 
 * @param {Token} identifier 
 * @returns {string}
 */
export function getLexeme(interpreter, identifier) {
    return interpreter.source.slice(identifier.start, identifier.end);
}

/**
 * 
 * @param {Interpreter} interpreter 
 * @param {Token} token 
 * @returns {Literal}
 */
export function getLiteral(interpreter, token) {
    switch (token.type) {
        case "StringLiteral": 
            return interpreter.source.slice(token.start + 1, token.end - 1);
        case "NumericLiteral":
            return parseFloat(interpreter.source.slice(token.start, token.end));
        case "Null":
        case "True":
        case "False":
            throw "Bro these are keywords, use if else directly";
        default:
            throw 0;
    }
}


