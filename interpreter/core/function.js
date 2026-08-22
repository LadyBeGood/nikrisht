// @ts-check

import "../types.js";
import { executeStatement } from "../phases/executor.js";
import { createEnvironment, declare } from "./environment.js";
import { ReturnSignal } from "./signals.js";


/**
 * Creates a runtime function object for a user-defined function.
 *
 * @param {FunctionDeclaration | FunctionExpression} declaration
 * @param {Environment} closure
 * @returns {_Function}
 */
export function create_Function(declaration, closure) {
    return {
        arity: declaration.parameters.length,
        declaration,
        closure,

        call(evaluator, args) {
            const environment = createEnvironment(closure);

            for (let i = 0; i < declaration.parameters.length; i++) {
                declare(environment, declaration.parameters[i].lexeme, args[i]);
            }

            const previous = evaluator.environment;
            evaluator.environment = environment;

            try {
                executeStatement(evaluator, declaration.body);
            } catch (thrown) {
                if (thrown instanceof ReturnSignal) {
                    return thrown.value;
                }
                    
                throw thrown;
            } finally {
                evaluator.environment = previous;
            }

            // A function that does not return anything, returns null.
            return null;
        },
    };
}
