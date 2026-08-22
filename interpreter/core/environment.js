// @ts-check

import { ImplementationError } from "../diagnostics/classes.js";
import { error } from "../diagnostics/report.js";
import "../types.js";

/**
 * Creates a new environment, optionally enclosing an outer scope.
 * 
 * @param {Environment} [enclosing]
 * @returns {Environment}
 */
export function createEnvironment(enclosing = undefined) {
    return {
        enclosing: enclosing,
        values: new Map(),
    }
}

/**
 * Defines a new variable binding in the current environment.
 * 
 * @param {Environment} environment 
 * @param {string} name 
 * @param {_Type} value 
 * @param {boolean} [reassignable=true] 
 */
export function declare(environment, name, value, reassignable = true) {
    environment.values.set(name, { value, reassignable });
}


/**
 * 
 * @param {Interpreter} interpreter
 * @param {Environment} environment 
 * @param {IdentifierExpression} node 
 * @param {_Type} value 
 */
export function assign(interpreter, environment, node, value) {
    const varInfo = environment.values.get(node.lexeme);

    if (varInfo !== undefined) {
        if (!varInfo.reassignable) {
            error(interpreter, node, `Cannot assign to constant "${node.lexeme}".`, "executor");
        }

        varInfo.value = value;
        return;
    }

    if (environment.enclosing !== undefined) {
        assign(interpreter, environment.enclosing, node, value);
        return;
    }

    error(interpreter, node, `Undefined variable "${node.lexeme}".`, "executor");
}




/**
 * 
 * @param {Interpreter} interpreter
 * @param {Environment} environment 
 * @param {IdentifierExpression} node
 * @param {number} distance 
 * @param {_Type} value 
 */
export function assignAt(interpreter, environment, node, distance, value) {
    const varInfo = ancestor(environment, distance).values.get(node.lexeme);

    if (varInfo === undefined) {
        throw new ImplementationError(`assignAt() found no variable "${node.lexeme}" at distance ${distance}.`);
    }

    if (!varInfo.reassignable) {
        error(interpreter, node, `Cannot assign to constant "${node.lexeme}".`, "executor");
    }

    varInfo.value = value;
}


/**
 * Resolves a variable by searching the environment chain.
 * 
 * @param {Interpreter} interpreter 
 * @param {Environment} environment 
 * @param {IdentifierExpression} node 
 * @returns {_Type}
 */
export function lookup(interpreter, environment, node) {
    const varInfo = environment.values.get(node.lexeme);

    if (varInfo !== undefined) {
        return varInfo.value;
    }

    if (environment.enclosing !== undefined) {
        return lookup(interpreter, environment.enclosing, node);
    }

    error(interpreter, node, `Undefined variable "${node.lexeme}".`, "executor");
}

/**
 * Retrieves a variable value from an environment at a known scope distance.
 * @param {Environment} environment 
 * @param {number} distance 
 * @param {IdentifierExpression} node 
 * @returns {_Type}
 */
export function lookupAt(environment, distance, node) {
    const varInfo = ancestor(environment, distance).values.get(node.lexeme);

    if (varInfo === undefined) {
        throw new ImplementationError(`lookupAt() found no variable "${node.lexeme}" at distance ${distance}.`);
    }

    return varInfo.value;
}


/**
 * 
 * @param {Environment} environment 
 * @param {number} distance 
 * @returns {Environment}
 */
export function ancestor(environment, distance) {
    let current = environment;

    for (let i = 0; i < distance; i++) {
        if (current.enclosing === undefined) {
            throw new ImplementationError("Invalid environment distance.");
        }

        current = current.enclosing;
    }

    return current;
}

