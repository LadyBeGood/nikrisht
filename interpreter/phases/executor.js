// @ts-check


import "../types.js";
import { is_Array, is_Boolean, is_Function, is_Null, is_Number, is_Object, is_String, type } from "../core/guards.js";
import { natives } from "../core/natives.js";
import { assign, assignAt, createEnvironment, declare, lookup, lookupAt } from "../core/environment.js";
import { createFunction } from "../core/function.js";
import { ExitSignal, ReturnSignal, SkipSignal } from "../core/signals.js";
import { getLexeme } from "../core/token.js";



/**
 * 
 * @param {Interpreter} interpreter 
 * @returns {Executor}
 */
export function createExecutor(interpreter) {
    const globals = createEnvironment();

    for (const [name, fn] of Object.entries(natives)) {
        declare(globals, name, fn);
    }

    return {
        interpreter,
        globals,
        environment: globals,
    }
}






/**
 * 
 * @param {Executor} executor 
 * @param {Environment} environment 
 * @param {Statement} body 
 * @returns {boolean}
 */
function executeLoopBody(executor, environment, body) {
    const previous = executor.environment;

    try {
        executor.environment = environment;
        executeStatement(executor, body);
        return false;
    } catch (thrown) {
        if (thrown instanceof ExitSignal) {
            return true;
        } else if (thrown instanceof SkipSignal) {
            return false;
        } else {
            throw thrown;
        }
    } finally {
        executor.environment = previous;
    }
}

/**
 * 
 * @param {Executor} executor 
 * @param {LoopStatement} statement 
 */
function executeLoopStatement(executor, statement) {
    // loop
    if (statement.iterable === undefined) {
        while (true) {
            if (executeLoopBody(executor, executor.environment, statement.body)) break;
        }

        return;
    }

    const iterable = executeExpression(executor, statement.iterable);

    // loop number with value
    if (is_Number(iterable)) {
        if (statement.binding?.index !== undefined) {
            throw new Error("Numeric loops do not support index bindings");
        }

        // 1-based counting, end inclusive
        for (let i = 1; i <= iterable; i++) {
            const environment = createEnvironment(executor.environment);

            if (statement.binding?.value !== undefined) {
                declare(environment, getLexeme(executor.interpreter, statement.binding.value), i);
            }

            if (executeLoopBody(executor, executor.environment, statement.body)) break;
        }
    }

    // loop condition
    else if (is_Boolean(iterable)) {
        if (statement.binding !== undefined) {
            throw new Error("Boolean loops do not support bindings");
        }

        while (executeExpression(executor, statement.iterable) === true) {
            if (executeLoopBody(executor, executor.environment, statement.body)) break;
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
            const environment = createEnvironment(executor.environment);

            if (statement.binding?.index !== undefined) {
                // 1-based index
                declare(environment, getLexeme(executor.interpreter, statement.binding.index), i + 1);
            }

            if (statement.binding?.value !== undefined) {
                declare(environment, getLexeme(executor.interpreter, statement.binding.value), iterable[i]);
            }

            if (executeLoopBody(executor, executor.environment, statement.body)) break;
        }
    }

    // loop object with key, value
    else if (is_Object(iterable)) {
        for (const [key, value] of iterable) {
            const environment = createEnvironment(executor.environment);

            if (statement.binding?.index !== undefined) {
                // key binding
                declare(environment, getLexeme(executor.interpreter, statement.binding.index), key);
            }

            if (statement.binding?.value !== undefined) {
                // value binding
                declare(environment, getLexeme(executor.interpreter, statement.binding.value), value);
            }

            if (executeLoopBody(executor, executor.environment, statement.body)) break;
        }
    }

    // loop function with value
    else if (is_Function(iterable)) {
        if (statement.binding?.index !== undefined) {
            throw new Error("Function loops do not support index bindings");
        }

        while (true) {
            const value = iterable.call(executor, []);

            // returning null ends the iteration
            if (value === null) {
                break;
            }

            const environment = createEnvironment(executor.environment);

            if (statement.binding?.value !== undefined) {
                declare(environment, getLexeme(executor.interpreter, statement.binding.value), value);
            }

            if (executeLoopBody(executor, executor.environment, statement.body)) break;
        }
    }

    else {
        throw new Error(`Value of type '${type(iterable)}' is not iterable`);
    }
}


/**
 * 
 * @param {Executor} executor 
 * @param {Expression} expression 
 * @returns {_Type}
 */
function executeExpression(executor, expression) {
    switch (expression.type) {
        case "LiteralExpression":
            return expression.value;

        case "GroupingExpression":
            return executeExpression(executor, expression.expression);

        case "VariableExpression": {
            const name = getLexeme(executor.interpreter, expression.name);
            const distance = executor.interpreter.locals.get(expression);

            if (distance !== undefined) {
                return lookupAt(executor.environment, distance, name);
            } else {
                return lookup(executor.globals, name);
            }
        }

        case "AssignmentExpression": {
            if (expression.left.type === "VariableExpression") {
                const name = getLexeme(executor.interpreter, expression.left.name);
                const value = executeExpression(executor, expression);
                const distance = executor.interpreter.locals.get(expression);
    
                if (distance !== undefined) {
                    assignAt(executor.environment, distance, name, value);
                } else {
                    assign(executor.environment, name, value);
                }
    
                return value;
            } else if (expression.left.type === "MemberExpression") {
                const subject = executeExpression(executor, expression.left.object);
                const index = executeExpression(executor, expression.left.property);

                if (is_Array(subject)) {
                    if (!is_Number(index)) {
                        throw 0;
                    }

                    if (index < 1 || index > subject.length) {
                        throw 0;
                    }

                    const value = executeExpression(executor, expression.right);
                    subject[index - 1] = value;
                    return value;
                } else if (is_Object(subject)) {
                    const value = executeExpression(executor, expression.right);
                    subject.set(index, value);
                    return value;
                }

                throw 0;
            }

            throw 0;
        }


        case "ArrayExpression": {
            const array = [];

            for (let i = 0; i < expression.elements.length; i++) {
                const item = executeExpression(executor, expression.elements[i]);
                array.push(item);
            }

            return array;
        }

        case "ObjectExpression": {
            const object = new Map();

            for (let i = 0; i < expression.keys.length; i++) {
                const key = executeExpression(executor, expression.keys[i]);
                const value = executeExpression(executor, expression.values[i]);
                object.set(key, value);
            }

            return object;
        }

        case "UnaryExpression": {
            const operand = executeExpression(executor, expression.argument);

            switch (expression.operator.type) {
                case "Minus":
                    if (!is_Number(operand)) {
                        throw 0;
                    } else {
                        return -operand;
                    }
                case "ExclamationMark":
                    if (!is_Boolean(operand)) {
                        throw 0;
                    } else {
                        throw !operand;
                    }
                default:
                    throw 1;
            }
        }
        case "BinaryExpression": {
            const left = executeExpression(executor, expression.left);
            const right = executeExpression(executor, expression.left);

            switch (expression.operator.type) {
                case "Equal":
                    return left === right;
                case "ExclamationMarkEqual":
                    return left !== right;
                case "Plus":
                    if (is_Number(left)) {
                        if (is_Number(right)) {
                            return left + right;
                        }

                        throw 0;
                    } else if (is_String(left)) {
                        if (is_String(right)) {
                            return left + right;
                        }

                        throw 0;
                    }

                    throw 0;
            }

            if (!is_Number(left) || !is_Number(right)) {
                throw 0;
            }

            switch (expression.operator.type) {
                case "Minus": return left - right;
                case "Slash": return left / right;
                case "Asterisk": return left * right;
                case "MoreThan": return left > right;
                case "LessThan": return left < right;
                case "MoreThanEqual": return left >= right;
                case "LessThanEqual": return left <= right;
                default: throw 0;
            }
        }

        case "CallExpression": {
            const callee = executeExpression(executor, expression.callee);
            if (!is_Function(callee)) {
                throw 0;
            }

            const args = [];

            for (const argument of expression.arguments) {
                args.push(executeExpression(executor, argument));
            }

            if (args.length != callee.arity) {
                throw 0;
            }

            return callee.call(executor, args);
        }

        case "FunctionExpression":
            return createFunction(executor.interpreter, expression, executor.environment);

        case "MemberExpression": {
            const subject = executeExpression(executor, expression.object);
            const index = executeExpression(executor, expression.property);

            if (is_Array(subject) || is_String(subject)) {
                if (!is_Number(index)) {
                    throw 0;
                }

                if (index < 1 || index > subject.length) {
                    throw 0;
                }

                return subject[index - 1];
            } else if (is_Object(subject)) {
                const value = subject.get(index);

                if (value === undefined) {
                    throw 0;
                }

                return value;
            }

            throw 0;
        }

        case "LogicalExpression": {
            const left = executeExpression(executor, expression.left);

            if (!is_Boolean(left)) {
                throw 0;
            }

            switch (expression.operator.type) {
                case "And":
                    // false & anything -> short-circuit to false
                    if (left === false) return false;
                    break;

                case "Bar":
                    // true | anything -> short-circuit to true
                    if (left === true) return true;
                    break;

                default:
                    /** @type {never} */
                    throw 0;
            }

            const right = executeExpression(executor, expression.right);

            if (!is_Boolean(right)) {
                throw 0;
            }

            return right;
        }


        default:
            throw 0;
    }
}

/**
 * 
 * @param {Executor} executor 
 * @param {Statement} statement 
 */
export function executeStatement(executor, statement) {
    switch (statement.type) {
        case "ExpressionStatement":
            executeExpression(executor, statement.expression);
            break;

        case "VariableDeclaration": {
            const value = statement.initialiser !== undefined
                ? executeExpression(executor, statement.initialiser)
                : null;

            declare(executor.environment, getLexeme(executor.interpreter, statement.name), value);
            break;
        }

        case "ConstantDeclaration": {
            const value = executeExpression(executor, statement.initialiser);
            declare(executor.environment, getLexeme(executor.interpreter, statement.name), value, /* reassignable */ false);
            break;
        }

        case "FunctionDeclaration": {
            const fn = createFunction(executor.interpreter, statement, executor.environment);

            declare(executor.environment, getLexeme(executor.interpreter, statement.name), fn);
            break;
        }

        case "BlockStatement": {
            const previous = executor.environment;

            try {
                executor.environment = createEnvironment(executor.environment);

                for (const stmt of statement.body) {
                    executeStatement(executor, stmt);
                }

            } finally {
                executor.environment = previous;
            }

            break;
        }

        case "IfStatement": {
            const condition = executeExpression(executor, statement.condition);

            if (!is_Boolean(condition)) {
                throw 0;
            }

            if (condition) {
                executeStatement(executor, statement.thenBranch);
            } else if (statement.elseBranch !== undefined) {
                executeStatement(executor, statement.elseBranch);
            }

            break;
        }

        case "ReturnStatement": {
            const value = statement.expression !== undefined
                ? executeExpression(executor, statement.expression)
                : null;

            throw new ReturnSignal(value);
        }

        case "ExitStatement": {
            throw new ExitSignal();
        }

        case "SkipStatement": {
            throw new SkipSignal();
        }

        case "LoopStatement": {
            executeLoopStatement(executor, statement)
            break;
        }

        default:
            /** @type {never} */
            throw 0;
    }
}

/**
 * 
 * @param {Executor} executor 
 * @param {Statement[]} statements 
 */
function executeStatements(executor, statements) {
    for (const statement of statements) {
        executeStatement(executor, statement);
    }
}

/**
 * 
 * @param {Executor} executor 
 */
export function execute(executor) {
    executeStatements(executor, executor.interpreter.statements);
}