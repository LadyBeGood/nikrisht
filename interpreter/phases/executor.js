// @ts-check


import "../types.js";
import { is_Array, is_Boolean, is_Function, is_Null, is_Number, is_Object, is_String, type } from "../core/guards.js";
import { natives } from "../core/natives.js";
import { assign, assignAt, createEnvironment, declare, lookup, lookupAt } from "../core/environment.js";
import { create_Function } from "../core/function.js";
import { ExitSignal, ReturnSignal, SkipSignal } from "../core/signals.js";
import { getLexeme } from "../core/token.js";
import { ExecutionError, ImplementationError } from "../diagnostics/classes.js";
import { error } from "../diagnostics/report.js";



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
            const environment = createEnvironment(executor.environment);
            if (executeLoopBody(executor, environment, statement.body)) break;
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
                declare(environment, statement.binding.value.lexeme, i);
            }

            if (executeLoopBody(executor, environment, statement.body)) break;
        }
    }

    // loop condition
    else if (is_Boolean(iterable)) {
        if (statement.binding !== undefined) {
            throw new Error("Boolean loops do not support bindings");
        }

        while (executeExpression(executor, statement.iterable) === true) {
            const environment = createEnvironment(executor.environment);
            if (executeLoopBody(executor, environment, statement.body)) break;
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
                declare(environment, statement.binding.index.lexeme, i + 1);
            }

            if (statement.binding?.value !== undefined) {
                declare(environment, statement.binding.value.lexeme, iterable[i]);
            }

            if (executeLoopBody(executor, environment, statement.body)) break;
        }
    }

    // loop object with key, value
    else if (is_Object(iterable)) {
        for (const [key, value] of iterable) {
            const environment = createEnvironment(executor.environment);

            if (statement.binding?.index !== undefined) {
                // key binding
                declare(environment, statement.binding.index.lexeme, key);
            }

            if (statement.binding?.value !== undefined) {
                // value binding
                declare(environment, statement.binding.value.lexeme, value);
            }

            if (executeLoopBody(executor, environment, statement.body)) break;
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
                declare(environment, statement.binding.value.lexeme, value);
            }

            if (executeLoopBody(executor, environment, statement.body)) break;
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

        case "IdentifierExpression": {
            const distance = executor.interpreter.locals.get(expression);

            if (distance !== undefined) {
                return lookupAt(executor.environment, distance, expression);
            } else {
                return lookup(executor.interpreter, executor.globals, expression);
            }
        }

        case "AssignmentExpression": {
            if (expression.left.type === "IdentifierExpression") {
                const value = executeExpression(executor, expression.right);
                const distance = executor.interpreter.locals.get(expression);

                if (distance !== undefined) {
                    assignAt(executor.interpreter, executor.environment, expression.left, distance,  value);
                } else {
                    assign(executor.interpreter, executor.environment, expression.left, value);
                }

                return value;
            } else if (expression.left.type === "MemberExpression") {
                const subject = executeExpression(executor, expression.left.object);
                const index = executeExpression(executor, expression.left.property);

                if (is_Array(subject)) {
                    if (!is_Number(index)) {
                        throw 1;
                    }

                    if (index < 1 || index > subject.length) {
                        throw 2;
                    }

                    const value = executeExpression(executor, expression.right);
                    subject[index - 1] = value;
                    return value;
                } else if (is_Object(subject)) {
                    const value = executeExpression(executor, expression.right);
                    subject.set(index, value);
                    return value;
                }

                throw 3;
            }

            throw 4;
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
                        throw 5;
                    } else {
                        return -operand;
                    }
                case "ExclamationMark":
                    if (!is_Boolean(operand)) {
                        throw 6;
                    } else {
                        throw !operand;
                    }
                default:
                    throw 1;
            }
        }
        case "BinaryExpression": {
            const left = executeExpression(executor, expression.left);
            const right = executeExpression(executor, expression.right);

            switch (expression.operator.type) {
                case "EqualEqual":
                    return left === right;
                case "ExclamationMarkEqual":
                    return left !== right;
                case "Plus":
                    if (is_Number(left)) {
                        if (is_Number(right)) {
                            return left + right;
                        }

                        throw 7;
                    } else if (is_String(left)) {
                        if (is_String(right)) {
                            return left + right;
                        }

                        throw 8;
                    }

                    throw 9;
            }

            if (!is_Number(left) || !is_Number(right)) {
                throw 10;
            }

            switch (expression.operator.type) {
                case "Minus": return left - right;
                case "Slash": return left / right;
                case "Asterisk": return left * right;
                case "MoreThan": return left > right;
                case "LessThan": return left < right;
                case "MoreThanEqual": return left >= right;
                case "LessThanEqual": return left <= right;
                default: throw new Error(JSON.stringify(expression, null, 4));
            }
        }

        case "CallExpression": {
            const callee = executeExpression(executor, expression.callee);
            if (!is_Function(callee)) {
                throw 12;
            }

            const args = [];

            for (const argument of expression.arguments) {
                args.push(executeExpression(executor, argument));
            }

            if (args.length != callee.arity) {
                throw 13;
            }

            return callee.call(executor, args);
        }

        case "FunctionExpression":
            return create_Function(expression, executor.environment);

        case "MemberExpression": {
            const subject = executeExpression(executor, expression.object);
            const index = executeExpression(executor, expression.property);

            if (is_Array(subject) || is_String(subject)) {
                if (!is_Number(index)) {
                    throw 14;
                }

                if (index < 1 || index > subject.length) {
                    throw 15;
                }

                return subject[index - 1];
            } else if (is_Object(subject)) {
                const value = subject.get(index);

                if (value === undefined) {
                    return null;
                }

                return value;
            }

            throw 17;
        }

        case "LogicalExpression": {
            const left = executeExpression(executor, expression.left);

            if (!is_Boolean(left)) {
                throw 18;
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
                    throw 19;
            }

            const right = executeExpression(executor, expression.right);

            if (!is_Boolean(right)) {
                throw 20;
            }

            return right;
        }

        case "RangeExpression": {
            const start = executeExpression(executor, expression.left);
            const end = executeExpression(executor, expression.right);

            if (!is_Number(start) || !is_Number(end)) {
                error(executor.interpreter, expression, "Both operands of the range operator should be numbers", "executor");
            }

            /** @type {_Type[]} */
            const array = [];
            for (let i = start; i < end; i++) {
                array.push(i);
            }
            return array;
            // const ascending = start <= end;
            // const step = ascending ? 1 : -1;
            // const operatorType = expression.operator.type;

            // let current = start;
            // let done = false;

            // return {
            //     arity: 0,
            //     call() {
            //         const environment = createEnvironment(executor.environment);
            //         const previous = executor.environment;
            //         executor.environment = environment;

            //         try {
            //             if (done) return null;

            //             if (operatorType === "DotDotLessThan") {
            //                 // exclusive of the end when counting up: 0..<3 -> 0, 1, 2, null
            //                 if (current >= end) { done = true; return null; }
            //             } else if (operatorType === "DotDotMoreThan") {
            //                 // exclusive of the end when counting down: 3..>1 -> 3, 2, null
            //                 if (current <= end) { done = true; return null; }
            //             } else {
            //                 // ".." is inclusive of both ends, direction inferred from start/end
            //                 if (ascending ? current > end : current < end) { done = true; return null; }
            //             }

            //             const value = current;
            //             current += step;
            //             return value;
            //         } finally {
            //             executor.environment = previous;
            //         }
                    
            //     }
            // };


        }

        default:
            throw new ImplementationError(`Unhandled expression:\n${JSON.stringify(expression, null, 4)}`);
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

            declare(executor.environment, statement.name.lexeme, value);
            break;
        }

        case "ConstantDeclaration": {
            const value = executeExpression(executor, statement.initialiser);
            declare(executor.environment, statement.name.lexeme, value, /* reassignable */ false);
            break;
        }

        case "FunctionDeclaration": {
            const fn = create_Function(statement, executor.environment);

            declare(executor.environment, statement.name.lexeme, fn);
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
                throw 21;
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
            throw new ImplementationError(`Unhandled statement:\n${JSON.stringify(statement, null, 4)}`);
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
    try {
        executeStatements(executor, executor.interpreter.statements);
    } catch (thrown) {
        if (thrown instanceof ExecutionError) {
            return;
        }

        throw thrown;
    }
}