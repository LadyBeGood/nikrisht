// @ts-check

import "../types.js";
import { executeStatement, executeExpression } from "../phases/executor.js";
import { createEnvironment, declare } from "./environment.js";
import { ReturnSignal } from "./signals.js";
import { error } from "../diagnostics/report.js";


/**
 * Creates a runtime function object for a user-defined function.
 *
 * @param {FunctionDeclaration | FunctionExpression} declaration
 * @param {Environment} closure
 * @returns {_Function}
 */
export function create_Function(declaration, closure) {
    return {
        arity: declaration.parameters.filter(p => p.defaultValue === undefined).length,
        declaration,
        closure,

        call(args, expression, executor) {
            const environment = createEnvironment(closure);
            const previous = executor.environment;
            executor.environment = environment;

            for (let i = 0; i < declaration.parameters.length; i++) {
                let argument = args[i];
                let defaultValue;

                if (declaration.parameters[i].defaultValue !== undefined) {
                    defaultValue = executeExpression(executor, /** @type {Expression} */ (declaration.parameters[i].defaultValue))
                }

                if (argument === undefined && defaultValue === undefined) {
                    error(executor.interpreter, expression, "message", "executor");
                } else if (argument === undefined) {
                    argument = /** @type {_Type} */(defaultValue);
                }
                
                declare(environment, declaration.parameters[i].name.lexeme, argument);
            }

            try {
                executeStatement(executor, declaration.body);
            } catch (thrown) {
                if (thrown instanceof ReturnSignal) {
                    return thrown.value;
                }
                    
                throw thrown;
            } finally {
                executor.environment = previous;
            }

            // A function that does not return anything, returns null.
            return null;
        },
    };
}
