// @ts-check

import "../types.js";
import { evaluateBlock } from "../phases/evaluator";
import { createEnvironment, declare } from "./environment";


/**
 * Creates a runtime function object for a user-defined function.
 *
 * @param {FunctionDeclaration | FunctionExpression} declaration
 * @param {Environment} closure
 * @returns {_Function}
 */
export function createFunction(declaration, closure) {
    return {
        arity: declaration.parameters.length,
        declaration,
        closure,

        call(evaluator, args) {
            const environment = createEnvironment(closure);

            for (let i = 0; i < declaration.parameters.length; i++) {
                declare(environment, declaration.parameters[i].lexeme, args[i]);
            }

            return evaluateBlock(evaluator, declaration.body, environment);
        },
    };
}
