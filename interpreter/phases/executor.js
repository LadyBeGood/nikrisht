// @ts-check


import "../types.js";
import { is_Array, is_Boolean, is_Function, is_Null, is_Number, is_Object, is_String, type } from "../core/guards.js";
import { natives, stringify } from "../core/natives.js";
import { assign, assignAt, createEnvironment, declare, lookup, lookupAt } from "../core/environment.js";
import { create_Function } from "../core/function.js";
import { ExitSignal, ReturnSignal, SkipSignal } from "../core/signals.js";
import { ExecutionError, ImplementationError } from "../diagnostics/classes.js";
import { error } from "../diagnostics/report.js";
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
            const environment = createEnvironment(executor.environment);
            if (executeLoopBody(executor, environment, statement.body)) break;
        }

        return;
    }

    const iterable = executeExpression(executor, statement.iterable);

    // loop number with value
    if (is_Number(iterable)) {
        if (statement.binding?.index !== undefined) {
            error(executor.interpreter, statement.binding.index, "Numeric loops do not support index bindings", "executor");
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
            error(executor.interpreter, statement.iterable, "Boolean loops do not support bindings", "executor");
        }

        while (executeExpression(executor, statement.iterable) === true) {
            const environment = createEnvironment(executor.environment);
            if (executeLoopBody(executor, environment, statement.body)) break;
        }
    }

    // loop null
    else if (is_Null(iterable)) {
        if (statement.binding !== undefined) {
            error(executor.interpreter, statement.iterable, "Null loops do not support bindings", "executor");
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
            error(executor.interpreter, statement.binding.index, "Function loops do not support index bindings", "executor");
        }

        while (true) {
            const value = iterable.call([], /** @type {CallExpression} */ (statement.iterable), executor);

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
        error(executor.interpreter, statement.iterable, `Value of type '${type(iterable)}' is not iterable`, "executor");
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
                        error(executor.interpreter, expression.left.property, `Array index must be a number, but got '${type(index)}'`, "executor");
                    }

                    if (index < 1 || index > subject.length) {
                        error(executor.interpreter, expression.left.property, `Array index out of bounds: index ${index} is outside range 1..${subject.length}]`, "executor");
                    }

                    const value = executeExpression(executor, expression.right);
                    subject[index - 1] = value;
                    return value;
                } else if (is_Object(subject)) {
                    const value = executeExpression(executor, expression.right);
                    subject.set(index, value);
                    return value;
                }

                error(executor.interpreter, expression.left.object, `Cannot assign property on value of type '${type(subject)}'`, "executor");
            }

            error(executor.interpreter, expression.left, "Invalid left-hand side in assignment expression", "executor");
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
                        error(executor.interpreter, expression.argument, `Operand for unary minus (-) must be a number, but got "${type(operand)}".`, "executor");
                    } else {
                        return -operand;
                    }
                case "ExclamationMark":
                    if (!is_Boolean(operand)) {
                        error(executor.interpreter, expression.argument, `Operand for logical NOT (!) must be a boolean, but got "${type(operand)}"`, "executor");
                    } else {
                        return !operand;
                    }
                default:
                    throw new ImplementationError(`Unsupported unary operator "${expression.operator.type}"`);
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

                        error(executor.interpreter, expression.right, `Cannot add value of type "${type(right)}" to a number`, "executor");
                    } else if (is_String(left)) {
                        if (is_String(right)) {
                            return left + right;
                        }

                        error(executor.interpreter, expression.right, `Cannot concatenate value of type "${type(right)}" to a string`, "executor");
                    }

                    error(executor.interpreter, expression.left, `Operator '+' cannot be applied to operands of type "${type(left)}" and "${type(right)}"`, "executor");
            }

            if (!is_Number(left) || !is_Number(right)) {
                error(executor.interpreter, expression, `Binary operator "${getLexeme(executor.interpreter, expression.operator)}" requires numeric operands, but got "${type(left)}" and "${type(right)}"`, "executor");
            }

            switch (expression.operator.type) {
                case "Minus": return left - right;
                case "Slash": return left / right;
                case "Asterisk": return left * right;
                case "MoreThan": return left > right;
                case "LessThan": return left < right;
                case "MoreThanEqual": return left >= right;
                case "LessThanEqual": return left <= right;
                default: throw new ImplementationError(`Unimplemented Binary operation "${getLexeme(executor.interpreter, expression.operator)}"`);
            }
        }

        case "CallExpression": {
            const callee = executeExpression(executor, expression.callee);
            if (!is_Function(callee)) {
                error(executor.interpreter, expression.callee, `Value of type "${type(callee)}" is not callable`, "executor");
            }

            const args = [];

            for (const argument of expression.arguments) {
                args.push(executeExpression(executor, argument));
            }

            if (args.length != callee.arity) {
                error(executor.interpreter, expression, `Function expects ${callee.arity} argument(s) but got ${args.length}`, "executor");
            }
                
            return callee.call(args, expression, executor);
        }

        case "FunctionExpression":
            return create_Function(expression, executor.environment);

        case "MemberExpression": {
            const subject = executeExpression(executor, expression.object);
            const index = executeExpression(executor, expression.property);

            if (is_Array(subject) || is_String(subject)) {
                if (!is_Number(index)) {
                    error(executor.interpreter, expression.property, `Index must be a number, but got "${type(index)}"`, "executor");
                }

                if (index < 1 || index > subject.length) {
                    error(executor.interpreter, expression.property, `Index out of bounds: ${index} is outside range 1..${subject.length}`, "executor");
                }

                return subject[index - 1];
            } else if (is_Object(subject)) {
                const value = subject.get(index);

                if (value === undefined) {
                    error(executor.interpreter, expression.property, `Property ${stringify(index, undefined, true)} does not exist on object`, "executor");
                }

                return value;
            }

            error(executor.interpreter, expression.object, `Cannot access property on value of type "${type(subject)}"`, "executor");
        }

        case "LogicalExpression": {
            const left = executeExpression(executor, expression.left);

            if (!is_Boolean(left)) {
                error(executor.interpreter, expression.left, `Left operand of logical expression must be a boolean, but got "${type(left)}"`, "executor");
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
                    throw new ImplementationError(`Unimplemented logical operator "${getLexeme(executor.interpreter, expression.operator)}"`);
            }

            const right = executeExpression(executor, expression.right);

            if (!is_Boolean(right)) {
                error(executor.interpreter, expression.right, `Right operand of logical expression must be a boolean, but got "${type(right)}"`, "executor");
            }

            return right;
        }

        case "RangeExpression": {
            const startVal = executeExpression(executor, expression.starting);
            const endVal = executeExpression(executor, expression.ending);
            const gapVal = expression.gap !== undefined
                ? executeExpression(executor, expression.gap)
                : undefined;

            if (!is_Number(startVal)) {
                error(executor.interpreter, expression.starting, `Range start bound must be a number, but got "${type(startVal)}"`, "executor");
            }
            if (!is_Number(endVal)) {
                error(executor.interpreter, expression.ending, `Range end bound must be a number, but got "${type(endVal)}"`, "executor");
            }
            if (gapVal !== undefined && !is_Number(gapVal)) {
                error(executor.interpreter, /** @type {Expression} */ (expression.gap), `Range gap must be a number, but got "${type(gapVal)}"`, "executor");
            }

            const operatorType = expression.operator.type; // "DotDot", "DotDotLessThan", "DotDotMoreThan"

            // Infer step size if missing
            let step = gapVal;
            if (step === undefined) {
                step = startVal <= endVal ? 1 : -1;
            }

            // Zero step would cause infinite loop
            if (step === 0) {
                error(executor.interpreter, /** @type {Expression} */ (expression.gap), "Range step size cannot be zero, it will cause an infinite loop", "executor");
            }

            // Mismatched direction check (e.g. 1..5 with step -1 or 5..1 with step 1)
            const isAscending = startVal <= endVal;
            if ((isAscending && step < 0) || (!isAscending && step > 0)) {
                // Invalid direction creates an immediately exhausted range
                return {
                    arity: 0,
                    call: () => null
                };
            }

            // Pick exact comparison predicate once at initialization
            let isWithinBounds;

            switch (expression.operator.type) {
                case "DotDotLessThan":
                    isWithinBounds = (/** @type {number} */ val) => val < endVal;
                    break;
                case "DotDotMoreThan":
                    isWithinBounds = (/** @type {number} */ val) => val > endVal;
                    break;
                case "DotDot":
                    isWithinBounds = step > 0
                        ? (/** @type {number} */ val) => val <= endVal
                        : (/** @type {number} */ val) => val >= endVal;
                    break;
                default:
                    throw new ImplementationError(`Unsupported range operator: ${expression.operator.type}`);
            }

            let index = 0;

            return {
                arity: 0,
                call: () => {
                    const current = startVal + index * step;

                    if (!isWithinBounds(current)) {
                        return null;
                    }

                    index++;
                    return current;
                }
            };
        }

        default:
            throw new ImplementationError(`Unimplemented expression:\n${JSON.stringify(expression, null, 4)}`);
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
                error(executor.interpreter, statement.condition, `If condition must evaluate to a boolean, but got "${type(condition)}"`, "executor");
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
            throw new ImplementationError(`Unimplemented statement:\n${JSON.stringify(statement, null, 4)}`);
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
    const previous = executor.environment;
    
    try {
        executor.environment = createEnvironment(executor.environment);
        executeStatements(executor, executor.interpreter.statements);
    } catch (thrown) {
        if (thrown instanceof ExecutionError) {
            return;
        }

        throw thrown;
    } finally {
        executor.environment = previous;
    }
}