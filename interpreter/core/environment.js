// @ts-check

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
 * @param {Environment} environment 
 * @param {Token} name 
 * @param {_Type} value 
 */
export function assign(environment, name, value) {
    const varInfo = environment.values.get(name.lexeme);

    if (varInfo !== undefined) {
        if (!varInfo.reassignable) {
            throw new Error(`Cannot assign to constant '${name.lexeme}'`);
        }

        varInfo.value = value;
        return;
    }

    if (environment.enclosing !== undefined) {
        assign(environment.enclosing, name, value);
        return;
    }

    throw new Error(`Undefined variable '${name.lexeme}'`);
}


/**
 * 
 * @param {Environment} environment 
 * @param {number} distance 
 * @param {Token} name 
 * @param {_Type} value 
 */
export function assignAt(environment, distance, name, value) {
    ancestor(environment, distance).values.set(name.lexeme, value);
}


/**
 * Resolves a variable by searching the environment chain.
 * 
 * @param {Environment} environment 
 * @param {Token} name 
 * @returns {_Type}
 */
export function lookup(environment, name) {
    const varInfo = environment.values.get(name.lexeme);

    if (varInfo !== undefined) {
        return varInfo.value;
    }

    if (environment.enclosing !== undefined) {
        return lookup(environment.enclosing, name);
    }

    throw new Error(`Undefined variable "${name.lexeme}"`);
}

/**
 * Retrieves a variable value from an environment at a known scope distance.
 * @param {Environment} environment 
 * @param {number} distance 
 * @param {string} name 
 * @returns {_Type}
 */
export function lookupAt(environment, distance, name) {
    return /** @type {_Type} */ (ancestor(environment, distance).values.get(name));
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
            throw new Error("Invalid environment distance");
        }

        current = current.enclosing;
    }

    return current;
}

