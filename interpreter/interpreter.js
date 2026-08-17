// @ts-check

import "./types.js"
import { createLexer, lex } from "./phases/lexer.js";
import { createParser, parse } from "./phases/parser.js";
import { createResolver, resolve } from "./phases/resolver.js";
import { createExecutor, execute } from "./phases/executor.js";

/**
 * Creates an `Interpreter` object
 * 
 * @param {string} source 
 * @returns {Interpreter} Interpreter state
 */
export function createInterpreter(source) {
    return {
        source,
        tokens: [],
        statements: [],
        locals: new Map(),
        diagnostics: [],
        success: false,
    };
}


/**
 * @param {Interpreter} interpreter
 * @returns {boolean}
 */
function hasErrors(interpreter) {
    return interpreter.diagnostics.some(diagnostic => diagnostic.severity === "error");
}


/**
 * Interprets nikrisht code
 * @param {Interpreter} interpreter Interpreter state
 */
export function interpret(interpreter) {
    /* Lexing */
    const lexer = createLexer(interpreter);
    lex(lexer);
    if (hasErrors(interpreter)) return interpreter;

    /* Parsing */
    const parser = createParser(interpreter);
    parse(parser);
    if (hasErrors(interpreter)) return interpreter;

    /* Resolving */
    const resolver = createResolver(interpreter);
    resolve(resolver);
    if (hasErrors(interpreter)) return interpreter;

    /* Executing */
    const executor = createExecutor(interpreter);
    execute(executor);
    if (!hasErrors(interpreter)) interpreter.success = true;
}

