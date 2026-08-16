// @ts-check


import "../types.js";
import { is_Array, is_Boolean, is_Function, is_Null, is_Number, is_Object, is_String, type } from "../core/guards.js";
import { natives } from "../core/natives.js";
import { createEnvironment, declare } from "../core/environment.js";
import { createFunction } from "../core/function.js";



/**
 * 
 * @param {*} diagnostics 
 * @returns {Evaluator}
 */
export function createEvaluator(diagnostics) {
    const globals = createEnvironment();

    for (const [name, fn] of Object.entries(natives)) {
        declare(globals, name, fn);
    }

    return {
        diagnostics,
        globals,
        environment: globals,
        locals: new Map(),
    }
}



/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Statement[] | Statement} statements 
 * @param {Environment} environment 
 */
export function evaluateBlock(evaluator, statements, environment) {
    const previous = evaluator.environment;

    try {
        evaluator.environment = environment;

        if (Array.isArray(statements)) {
            for (const statement of statements) {
                evaluateStatement(evaluator, statement)
            }
        } else {
            evaluateStatement(evaluator, statements)
        }

    } finally {
        evaluator.environment = previous;
    }
}


/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Environment} environment 
 * @param {Statement} body 
 * @returns {"normal" | "exit" | "skip"}
 */
function evaluateLoopBody(evaluator, environment, body) {
    const previous = evaluator.environment;

    try {
        evaluator.environment = environment;
        evaluateStatement(evaluator, body);
        return "normal";
    } catch (error) {
        if (error === "exit") return "exit";
        if (error === "skip") return "skip";
        throw error;
    } finally {
        evaluator.environment = previous;
    }
}


/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Expression} expression 
 * @returns {_Type}
 */
function evaluateExpression(evaluator, expression) {
    return null
}

/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Statement} statement 
 */
function evaluateStatement(evaluator, statement) {
    switch (statement.type) {
        case "ExpressionStatement":
            evaluateExpression(evaluator, statement.expression);
            break;

        case "VariableDeclaration": {
            const value = statement.initialiser !== undefined
                ? evaluateExpression(evaluator, statement.initialiser)
                : null;

            declare(evaluator.environment, statement.name.lexeme, value);
            break;
        }

        case "ConstantDeclaration": {
            const value = evaluateExpression(evaluator, statement.initialiser);
            declare(evaluator.environment, statement.name.lexeme, value, /* reassignable */ false);
            break;
        }

        case "FunctionDeclaration": {
            const fn = createFunction(statement, evaluator.environment);

            declare(evaluator.environment, statement.name.lexeme, fn);
            break;
        }

        case "BlockStatement": {
            evaluateBlock(evaluator, statement.statements, createEnvironment(evaluator.environment));
            break;
        }

        case "IfStatement": {
            const condition = evaluateExpression(evaluator, statement.condition);

            if (!is_Boolean(condition)) {
                throw 0;
            }

            if (condition) {
                evaluateStatement(evaluator, statement.thenBranch);
            } else if (statement.elseBranch !== undefined) {
                evaluateStatement(evaluator, statement.elseBranch);
            }

            break;
        }

        case "ReturnStatement": {
            const value = statement.expression !== undefined
                ? evaluateExpression(evaluator, statement.expression)
                : null;

            throw value;
        }

        case "ExitStatement": {
            throw "exit"
        }

        case "SkipStatement": {
            throw "skip"
        }

        case "LoopStatement": {
            // loop
            if (statement.iterable === undefined) {
                while (true) {
                    const result = evaluateLoopBody(evaluator, evaluator.environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }

                break;
            }

            const iterable = evaluateExpression(evaluator, statement.iterable);

            // loop number with value
            if (is_Number(iterable)) {
                if (statement.binding?.index !== undefined) {
                    throw new Error("Numeric loops do not support index bindings");
                }

                for (let i = 0; i < iterable; i++) {
                    const environment = createEnvironment(evaluator.environment);

                    if (statement.binding?.value !== undefined) {
                        // 1-based counting
                        declare(environment, statement.binding.value.lexeme, i + 1);
                    }

                    const result = evaluateLoopBody(evaluator, environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            // loop condition
            else if (is_Boolean(iterable)) {
                if (statement.binding !== undefined) {
                    throw new Error("Boolean loops do not support bindings");
                }

                while (evaluateExpression(evaluator, statement.iterable) === true) {
                    const result = evaluateLoopBody(evaluator, evaluator.environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            // loop null
            else if (is_Null(iterable)) {
                if (statement.binding !== undefined) {
                    throw new Error("Null loops do not support bindings");
                }
            }

            // loop array/string with index, value
            else if (is_Array(iterable) || is_String(iterable)) {
                for (let i = 0; i < iterable.length; i++) {
                    const environment = createEnvironment(evaluator.environment);

                    if (statement.binding?.index !== undefined) {
                        // 1-based index
                        declare(environment, statement.binding.index.lexeme, i + 1);
                    }

                    if (statement.binding?.value !== undefined) {
                        declare(environment, statement.binding.value.lexeme, iterable[i]);
                    }

                    const result = evaluateLoopBody(evaluator, environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            // loop object with key, value
            else if (is_Object(iterable)) {
                for (const [key, value] of iterable) {
                    const environment = createEnvironment(evaluator.environment);

                    if (statement.binding?.index !== undefined) {
                        // key binding
                        declare(environment, statement.binding.index.lexeme, key);
                    }

                    if (statement.binding?.value !== undefined) {
                        // value binding
                        declare(environment, statement.binding.value.lexeme, value);
                    }

                    const result = evaluateLoopBody(evaluator, environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            // loop function with value
            else if (is_Function(iterable)) {
                if (statement.binding?.index !== undefined) {
                    throw new Error("Function loops do not support index bindings");
                }

                while (true) {
                    const value = iterable.call(evaluator, []);

                    // returning null ends the iteration
                    if (value === null) {
                        break;
                    }

                    const environment = createEnvironment(evaluator.environment);

                    if (statement.binding?.value !== undefined) {
                        declare(environment, statement.binding.value.lexeme, value);
                    }

                    const result = evaluateLoopBody(evaluator, environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            else {
                throw new Error(`Value of type '${type(iterable)}' is not iterable`);
            }

            break;
        }

        default:
            /** @type {never} */
            throw 0;
    }
}

/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Statement[]} statements 
 */
export function evaluate(evaluator, statements) {
    for (const statement of statements) {
        evaluateStatement(evaluator, statement);
    }
}