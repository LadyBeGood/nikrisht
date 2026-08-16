// @ts-check


import "../types.js";
import { is_Array, is_Boolean, is_Function, is_Null, is_Number, is_Object, is_String, type } from "../core/guards.js";
import { natives } from "../core/natives.js";
import { assign, assignAt, createEnvironment, declare, lookup, lookupAt } from "../core/environment.js";
import { createFunction } from "../core/function.js";
import { ExitSignal, ReturnSignal, SkipSignal } from "../core/signals.js";



/**
 * 
 * @param {Statement[]} statements 
 * @returns {Evaluator}
 */
export function createEvaluator(statements) {
    const globals = createEnvironment();

    for (const [name, fn] of Object.entries(natives)) {
        declare(globals, name, fn);
    }

    return {
        diagnostics: [],
        statements,
        globals,
        environment: globals,
        locals: new Map(),
    }
}






/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Environment} environment 
 * @param {Statement} body 
 * @returns {boolean}
 */
function evaluateLoopBody(evaluator, environment, body) {
    const previous = evaluator.environment;

    try {
        evaluator.environment = environment;
        evaluateStatement(evaluator, body);
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
        evaluator.environment = previous;
    }
}

/**
 * 
 * @param {Evaluator} evaluator 
 * @param {LoopStatement} statement 
 */
function evaluateLoopStatement(evaluator, statement) {
    // loop
    if (statement.iterable === undefined) {
        while (true) {
            if (evaluateLoopBody(evaluator, evaluator.environment, statement.body)) break;
        }

        return;
    }

    const iterable = evaluateExpression(evaluator, statement.iterable);

    // loop number with value
    if (is_Number(iterable)) {
        if (statement.binding?.index !== undefined) {
            throw new Error("Numeric loops do not support index bindings");
        }

        // 1-based counting, end inclusive
        for (let i = 1; i <= iterable; i++) {
            const environment = createEnvironment(evaluator.environment);

            if (statement.binding?.value !== undefined) {
                declare(environment, statement.binding.value.lexeme, i);
            }

            if (evaluateLoopBody(evaluator, evaluator.environment, statement.body)) break;
        }
    }

    // loop condition
    else if (is_Boolean(iterable)) {
        if (statement.binding !== undefined) {
            throw new Error("Boolean loops do not support bindings");
        }

        while (evaluateExpression(evaluator, statement.iterable) === true) {
            if (evaluateLoopBody(evaluator, evaluator.environment, statement.body)) break;
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

            if (evaluateLoopBody(evaluator, evaluator.environment, statement.body)) break;
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

            if (evaluateLoopBody(evaluator, evaluator.environment, statement.body)) break;
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

            if (evaluateLoopBody(evaluator, evaluator.environment, statement.body)) break;
        }
    }

    else {
        throw new Error(`Value of type '${type(iterable)}' is not iterable`);
    }
}


/**
 * 
 * @param {Evaluator} evaluator 
 * @param {Expression} expression 
 * @returns {_Type}
 */
function evaluateExpression(evaluator, expression) {
    switch (expression.type) {
        case "LiteralExpression":
            return expression.value;

        case "GroupingExpression":
            return evaluateExpression(evaluator, expression.expression);

        case "VariableExpression": {
            const name = expression.name.lexeme;
            const distance = evaluator.locals.get(expression);

            if (distance !== undefined) {
                return lookupAt(evaluator.environment, distance, name);
            } else {
                return lookup(evaluator.globals, name);
            }
        }

        case "AssignmentExpression": {
            const name = expression.name.lexeme;
            const value = evaluateExpression(evaluator, expression);
            const distance = evaluator.locals.get(expression);

            if (distance !== undefined) {
                assignAt(evaluator.environment, distance, name, value);
            } else {
                assign(evaluator.environment, name, value);
            }
            
            return value;
        }

        case "ArrayExpression": {
            const array = [];

            for (let i = 0; i < expression.items.length; i++) {
                const item = evaluateExpression(evaluator, expression.items[i]);
                array.push(item);
            }

            return array;
        }

        case "ObjectExpression": {
            const object = new Map();

            for (let i = 0; i < expression.keys.length; i++) {
                const key = evaluateExpression(evaluator, expression.keys[i]);
                const value = evaluateExpression(evaluator, expression.values[i]);
                object.set(key,  value);
            }

            return object;
        }

        case "UnaryExpression": {
            const operand = evaluateExpression(evaluator, expression.expression);

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
            const left = evaluateExpression(evaluator, expression.left);
            const right = evaluateExpression(evaluator, expression.left);

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
            const callee = evaluateExpression(evaluator, expression.callee);
            if (!is_Function(callee)) {
                throw 0;
            }

            const args = [];

            for (const argument of expression.arguments) {
                args.push(evaluateExpression(evaluator, argument));
            }

            if (args.length != callee.arity) {
                throw 0;
            }

            return callee.call(evaluator, args);
        }

        case "FunctionExpression":
            return createFunction(expression, evaluator.environment);
        
        case "IndexExpression": {
            const subject = evaluateExpression(evaluator, expression.object);
            const index = evaluateExpression(evaluator, expression.index);

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
        
        case "IndexedAssignmentExpression": {
            const subject = evaluateExpression(evaluator, expression.left.object);
            const index = evaluateExpression(evaluator, expression.left.index);

            if (is_Array(subject)) {
                if (!is_Number(index)) {
                    throw 0;
                }

                if (index < 1 || index > subject.length) {
                    throw 0;
                }

                const value = evaluateExpression(evaluator, expression.value);
                subject[index - 1] = value;
                return value;
            } else if (is_Object(subject)) {
                const value = evaluateExpression(evaluator, expression.value);
                subject.set(index, value);
                return value;
            }

            throw 0;
        }

        case "LogicalExpression": {
            const left = evaluateExpression(evaluator, expression.left);
            
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

            const right = evaluateExpression(evaluator, expression.right);

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
 * @param {Evaluator} evaluator 
 * @param {Statement} statement 
 */
export function evaluateStatement(evaluator, statement) {
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
            const previous = evaluator.environment;

            try {
                evaluator.environment = createEnvironment(evaluator.environment);

                for (const stmt of statement.statements) {
                    evaluateStatement(evaluator, stmt);
                }

            } finally {
                evaluator.environment = previous;
            }

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

            throw new ReturnSignal(value);
        }

        case "ExitStatement": {
            throw new ExitSignal();
        }

        case "SkipStatement": {
            throw new SkipSignal();
        }

        case "LoopStatement": {
            evaluateLoopStatement(evaluator, statement)
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
function evaluateStatements(evaluator, statements) {
    for (const statement of statements) {
        evaluateStatement(evaluator, statement);
    }
}

/**
 * 
 * @param {Evaluator} evaluator 
 */
export function evaluate(evaluator) {
    evaluateStatements(evaluator, evaluator.statements)
}