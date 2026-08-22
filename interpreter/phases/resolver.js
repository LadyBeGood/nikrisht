// @ts-check

import { ImplementationError, ResolvingError } from "../diagnostics/classes.js";
import { error } from "../diagnostics/report.js";
import "../types.js";

/**
 * 
 * @param {*} interpreter 
 * @returns {Resolver}
 */
export function createResolver(interpreter) {
    return {
        interpreter,
        scopes: [],
        functionDepth: 0,
        loopDepth: 0,
    }
}


/**
 * 
 * @param {Resolver} resolver 
 */
function beginScope(resolver) {
    resolver.scopes.push(new Map());
}

/**
 * 
 * @param {Resolver} resolver 
 */
function endScope(resolver) {
    resolver.scopes.pop();
}

/**
 * Returns the innermost active scope.
 * 
 * @note 
 * Assumes at least one scope is active.
 * Calling this function when `resolver.scopes` is empty returns undefined, 
 * so callers should ensure a scope has been created with `beginScope()` beforehand.
 * 
 * @param {Resolver} resolver 
 * @returns {Resolver["scopes"][number]}
 */
function peek(resolver) {
    if (resolver.scopes.length === 0) {
        throw new ImplementationError("peek() called on resolver with no active scope.");
    } else {
        return resolver.scopes[resolver.scopes.length - 1];
    }
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {IdentifierExpression} name 
 */
function declare(resolver, name) {
    if (resolver.scopes.length === 0) {
        return;
    }

    const scope = peek(resolver);

    if (scope.has(name.lexeme)) {
        error(resolver.interpreter, name, `Variable "${name.lexeme}" is already declared in this scope.`, "resolver");
    }

    scope.set(name.lexeme, false);
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {IdentifierExpression} name 
 */
function define(resolver, name) {
    if (resolver.scopes.length === 0) {
        return;
    }

    peek(resolver).set(name.lexeme, true);
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {Expression} node 
 * @param {string} name
 */
function resolveLocal(resolver, node, name) {
    for (let i = resolver.scopes.length - 1; i >= 0; i--) {
        if (resolver.scopes[i].has(name)) {
            resolver.interpreter.locals.set(node, resolver.scopes.length - 1 - i);
            return;
        }
    }
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {FunctionDeclaration | FunctionExpression} fn 
 */
function resolveFunction(resolver, fn) {
    if (fn.name !== undefined) {
        declare(resolver, fn.name);
        define(resolver, fn.name);
    }

    resolver.functionDepth++;
    beginScope(resolver);

    for (const parameter of fn.parameters) {
        declare(resolver, parameter);
        define(resolver, parameter);
    }

    resolveStatement(resolver, fn.body);

    endScope(resolver);
    resolver.functionDepth--;
}


/**
 * 
 * @param {Resolver} resolver 
 * @param {Expression} expression 
 */
function resolveExpression(resolver, expression) {
    switch (expression.type) {
        case "IdentifierExpression":
            if (resolver.scopes.length > 0) {
                const scope = peek(resolver);

                if (scope.has(expression.lexeme) && scope.get(expression.lexeme) === false) {
                    error(resolver.interpreter, expression, `Cannot read local variable "${expression.lexeme}" in its own initializer.`, "resolver")
                }
            }
            resolveLocal(resolver, expression, expression.lexeme);
            break;
        case "FunctionExpression":
            resolveFunction(resolver, expression);
            break;
        case "GroupingExpression":
            resolveExpression(resolver, expression.expression);
            break;
        case "UnaryExpression":
            resolveExpression(resolver, expression.argument);
            break;
        case "AssignmentExpression":
            resolveExpression(resolver, expression.left);
            resolveExpression(resolver, expression.right);
            break;
        case "BinaryExpression":
        case "LogicalExpression":
            resolveExpression(resolver, expression.left);
            resolveExpression(resolver, expression.right);
            break;
        case "CallExpression":
            resolveExpression(resolver, expression.callee);
            for (const argument of expression.arguments) {
                resolveExpression(resolver, argument);
            }
            break;
        case "MemberExpression":
            resolveExpression(resolver, expression.object);
            resolveExpression(resolver, expression.property);
            break;
        case "ArrayExpression":
            for (const item of expression.elements) {
                resolveExpression(resolver, item);
            }
            break;
        case "ObjectExpression":
            for (let i = 0; i < expression.keys.length; i++) {
                resolveExpression(resolver, expression.keys[i]);
                resolveExpression(resolver, expression.values[i]);
            }
            break;
        case "RangeExpression":
            resolveExpression(resolver, expression.left)
            resolveExpression(resolver, expression.right)
            break;
        case "LiteralExpression":
            // Eat five star, do nothing :)
            break;
        default:
            throw new ImplementationError("Unknown expression type.");
    }
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {Statement} statement
 */
function resolveStatement(resolver, statement) {
    switch (statement.type) {
        case "BlockStatement":
            beginScope(resolver);
            resolveStatements(resolver, statement.body)
            endScope(resolver);
            break;
        case "ExpressionStatement":
            resolveExpression(resolver, statement.expression);
            break;
        case "IfStatement":
            resolveExpression(resolver, statement.condition);
            resolveStatement(resolver, statement.thenBranch);
            if (statement.elseBranch !== undefined) resolveStatement(resolver, statement.elseBranch);
            break;
        case "ReturnStatement":
            if (resolver.functionDepth <= 0) error(resolver.interpreter, statement, `Cannot use "return" outside of a function.`, "resolver");
            if (statement.expression) resolveExpression(resolver, statement.expression);
            break;
        case "ExitStatement":
        case "SkipStatement":
            if (resolver.loopDepth <= 0) error(resolver.interpreter, statement, `Cannot use "${statement.type === "ExitStatement" ? "exit" : "skip"}" outside of a loop.`, "resolver");
            break;
        case "VariableDeclaration":
        case "ConstantDeclaration":
            declare(resolver, statement.name);
            if (statement.initialiser !== undefined) resolveExpression(resolver, statement.initialiser);
            define(resolver, statement.name);
            break;
        case "FunctionDeclaration":
            resolveFunction(resolver, statement);
            break;
        case "LoopStatement":
            if (statement.iterable !== undefined) resolveExpression(resolver, statement.iterable);

            // The resolver unconditionally creates a scope, irrespective of the fact that 
            // there may not be any bindings for the loop. This is a common cause of error in executor.
            // Make sure to always create a new environment for every loop construct.
            beginScope(resolver);

            if (statement.binding?.index) {
                declare(resolver, statement.binding.index);
                define(resolver, statement.binding.index);
            }

            if (statement.binding?.value) {
                declare(resolver, statement.binding.value);
                define(resolver, statement.binding.value);
            }

            resolver.loopDepth++;

            resolveStatement(resolver, statement.body)

            resolver.loopDepth--;
            endScope(resolver);
            break;
        default:
            throw new ImplementationError("Unknown statement type.");
    }
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {Statement[]} statements 
 */
function resolveStatements(resolver, statements) {
    for (const statement of statements) {
        resolveStatement(resolver, statement);
    }
}


/**
 * 
 * @param {Resolver} resolver 
 */
export function resolve(resolver) {
    try {
        resolveStatements(resolver, resolver.interpreter.statements);
    } catch (thrown) {
        if (thrown instanceof ResolvingError) {
            return;
        }

        throw thrown;
    }
}