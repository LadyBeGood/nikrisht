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
 * @param {Host} host 
 * @returns {Interpreter} Interpreter state
 */
export function createInterpreter(source, host) {
    return {
        host,
        source,
        tokens: [],
        statements: [],
        locals: new Map(),
        diagnostics: [],
        success: true,
    };
}


/**
 * @param {Interpreter} interpreter
 * @returns {boolean}
 */
function hasErrors(interpreter) {
    return interpreter.diagnostics.some(diagnostic => diagnostic.type === "error");
}

/**
 * Checks for errors and marks the interpreter as failed if present.
 * @param {Interpreter} interpreter
 * @returns {boolean}
 */
function failed(interpreter) {
    if (hasErrors(interpreter)) {
        interpreter.success = false;
        return true;
    }
    return false;
}

/**
 * Interprets nikrisht code
 * @param {Interpreter} interpreter Interpreter state
 */
export function interpret(interpreter) {
    /* Lexing */
    const lexer = createLexer(interpreter);
    lex(lexer);
    if (failed(interpreter)) return;

    /* Parsing */
    const parser = createParser(interpreter);
    parse(parser);
    if (failed(interpreter)) return;

    /* Resolving */
    const resolver = createResolver(interpreter);
    resolve(resolver);
    if (failed(interpreter)) return;

    /* Executing */
    const executor = createExecutor(interpreter);
    execute(executor);
    if (failed(interpreter)) return;
}

