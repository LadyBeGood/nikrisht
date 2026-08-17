
// @ts-check

import { getRange } from "../core/range";
import { LexingError, ParsingError, ResolvingError, ExecutionError, ImplementationError } from "./errors"
import { formatTemplate } from "./format"

/**
 * Why didn't I put this inside `types.js`? Because TypeScript is stupid and won't let
 * import symbols from any module there.
 * 
 * @typedef { typeof LexingError 
 *          | typeof ParsingError 
 *          | typeof ResolvingError 
 *          | typeof ExecutionError } PhaseError
 */

/**
 * I don't know why I decided to put this too here, but TypeScript is stupid.
 * 
 * @typedef { "lexer" 
 *          | "parser"
 *          | "resolver"
 *          | "executor" } PhaseName
 */

/**
 * Why a seprate function for just one operation? Because this might change in future.
 * 
 * @param {Interpreter} interpreter
 * @param {SourceSpan} node
 * @param {DiagnosticDefinition} definition 
 * @param {...*} args 
 */
export function report(interpreter, node, definition, ...args) {
    const { code, template, type } = definition;

    const message = formatTemplate(template, args);

    const [ phase, ErrorClass ] = getPhaseAndError(code);

    const startingLine = interpreter.host === "browser" ? 0 : 1;
    const startingColumn = interpreter.host === "browser" ? 0 : 1;
    const { startLine, endLine, startColumn, endColumn } = getRange(interpreter, node, startingLine, startingColumn);

    interpreter.diagnostics.push({ 
        type, 
        code, 
        phase,
        message, 
        startLine,
        endLine,
        startColumn,
        endColumn,
    });

    if (type === "error") {
        throw new ErrorClass()
    }
}

/**
 *      
 * @param {number} code 
 * @returns {[PhaseName, PhaseError]}
 */
function getPhaseAndError(code) {
    if (code >= 1000 && code <= 1999) {
        return ["lexer", LexingError]
    }

    if (code >= 2000 && code <= 2999) {
        return ["parser", ParsingError]
    }
    
    if (code >= 3000 && code <= 3999) {
        return ["resolver", ResolvingError]
    }
    
    if (code >= 4000 && code <= 4999) {
        return ["executor", ExecutionError]
    }

    throw new ImplementationError("Invalid error code. Error code must be between 1000 and 4999 (both inclusive).")
}
