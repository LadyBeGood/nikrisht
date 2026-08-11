
// @ts-check

/**
 * 
 * @param {*} interpreter 
 * @returns {Resolver}
 */
function createResolver(interpreter) {
    return {
        diagnostics: [],
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
        throw 0;
    } else {
        return resolver.scopes[resolver.scopes.length - 1];
    }
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {Token} name 
 */
function declare(resolver, name) {
    if (resolver.scopes.length === 0) {
        return;
    }

    const scope = peek(resolver);

    if (scope.has(name.lexeme)) {
        throw 0;
    }

    scope.set(name.lexeme, true);
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {Token} name 
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
 * @param {{ name: Token }} expression 
 */
function resolveLocal(resolver, expression) {
    for (let i = resolver.scopes.length - 1; i >= 0; i--) {
        if (resolver.scopes[i].has(expression.name.lexeme)) {
            resolver.interpreter.resolve(expression, resolver.scopes.length - 1 - i);
            return;
        }
    }
}

/**
 * 
 * @param {Resolver} resolver 
 * @param {{ name: Token | undefined, parameters: Token[], body: Statement }} fn 
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
        case "VariableExpression":
            if (resolver.scopes.length > 0) {
                if (!peek(resolver).get(expression.name.lexeme)) {
                    throw 1;
                }
            }
            resolveLocal(resolver, expression);
            break;
        case "FunctionExpression":
            resolveFunction(resolver, expression);
            break;
        case "GroupingExpression":
        case "UnaryExpression":
            resolveExpression(resolver, expression.expression);
            break;
        case "AssignmentExpression":
            resolveExpression(resolver, expression.value);
            resolveLocal(resolver, expression);
            break;
        case "IndexedAssignmentExpression":
            resolveExpression(resolver, expression.left);
            resolveExpression(resolver, expression.value);
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
        case "IndexExpression":
            resolveExpression(resolver, expression.object);
            resolveExpression(resolver, expression.index);
            break;
        case "ArrayExpression":
            for (const item of expression.items) {
                resolveExpression(resolver, item);
            }
            break;
        case "ObjectExpression":
            for (let i = 0; i < expression.keys.length; i++) {
                resolveExpression(resolver, expression.keys[i]);
                resolveExpression(resolver, expression.values[i]);
            }
            break;
        case "LiteralExpression":
            // Eat five star, do nothing :)
            break;
        default:
            throw 0;
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
            resolve(resolver, statement.statements)
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
            if (resolver.functionDepth <= 0) throw 0;
            if (statement.expression) resolveExpression(resolver, statement.expression);
            break;
        case "ExitStatement":
        case "SkipStatement":
            if (resolver.loopDepth <= 0) throw 0;
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
        default:
            throw 0;
    }
}


/**
 * 
 * @param {Resolver} resolver 
 * @param {Statement[]} statements
 */
function resolve(resolver, statements) {
	for (const statement of statements) {
        resolveStatement(resolver, statement);
    }
}