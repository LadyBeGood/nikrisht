
// @ts-check

import { getRange } from "../core/range.js";
import { LexingError, ParsingError, ResolvingError, ExecutionError, ImplementationError } from "./classes.js"

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
 *      
 * @param {PhaseName} phase 
 * @returns {PhaseError}
 */
function getPhaseError(phase) {
    switch (phase) {
        case "lexer": 
            return LexingError;
        case "parser": 
            return ParsingError;
        case "resolver": 
            return ResolvingError;
        case "executor": 
            return ExecutionError;

        default: 
            throw new ImplementationError("Invalid error code. Error code must be between 1000 and 4999 (both inclusive).");
    }
}


/**
 * 
 * @param {Interpreter} interpreter
 * @param {SourceSpan} node
 * @param {string} message 
 * @param {PhaseName} phase 
 * @returns {never}
 * @throws {PhaseError}
 */
export function error(interpreter, node, message, phase) {
    const ErrorClass = getPhaseError(phase);

    const startingLine = interpreter.host === "browser" ? 0 : 1;
    const startingColumn = interpreter.host === "browser" ? 0 : 1;
    const { startLine, endLine, startColumn, endColumn } = getRange(interpreter, node, startingLine, startingColumn);

    interpreter.diagnostics.push({
        type: "error",
        phase,
        message,
        startLine,
        endLine,
        startColumn,
        endColumn,
    });

    throw new ErrorClass()
}


/**
 * 
 * @param {Interpreter} interpreter
 * @param {SourceSpan} node
 * @param {string} message 
 * @param {PhaseName} phase 
 */
export function warn(interpreter, node, message, phase) {
    const startingLine = interpreter.host === "browser" ? 0 : 1;
    const startingColumn = interpreter.host === "browser" ? 0 : 1;
    const { startLine, endLine, startColumn, endColumn } = getRange(interpreter, node, startingLine, startingColumn);

    interpreter.diagnostics.push({
        type: "warning",
        phase,
        message,
        startLine,
        endLine,
        startColumn,
        endColumn,
    });
}

