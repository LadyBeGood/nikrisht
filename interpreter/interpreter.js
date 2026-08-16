// @ts-check

import "./types.js"
import { createLexer, lex } from "./phases/lexer.js";
import { createParser, parse } from "./phases/parser.js";
import { createResolver, resolve } from "./phases/resolver.js";
import { createEvaluator, evaluate } from "./phases/evaluator.js";

/**
 * Creates an `Interpreter` object
 * 
 * @param {string} source 
 * @param {*} [logger=console]
 * @returns {Interpreter} Interpreter state
 */
export function createInterpreter(source, logger = console) {
    return {
        source,
        logger,
    };
}


/**
 * Compiles Nikrisht code into javascript code.
 * @param {Interpreter} interpreter Interpreter state
 */
export function interpret(interpreter) {
    try {
        const input = interpreter.source;

        /* Lexing */
        const lexer = createLexer(input);
        const tokens = lex(lexer);

        /* Parsing */
        const parser = createParser(tokens);
        const statements = parse(parser);

        // /* Analysing */
        const resolver = createResolver(statements);
        resolve(resolver);

        const evaluator = createEvaluator(statements);
        const output = evaluate(evaluator);

        // return { tokens };
    } catch (error) {
        if (error instanceof EndProgram) {
            // No operations
            return { tokens: [], statements: [] }
        } else {
            // rethrow it if it is a different error
            throw error
        }
    }
}
