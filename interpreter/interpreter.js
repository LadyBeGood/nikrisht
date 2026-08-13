// @ts-check


import "./types.js";


/** @param {_Type} value @returns {value is _Number} */
function is_Number(value) {
    return typeof value === "number";
}

/** @param {_Type} value @returns {value is _String} */
function is_String(value) {
    return typeof value === "string";
}

/** @param {_Type} value @returns {value is _Boolean} */
function is_Boolean(value) {
    return typeof value === "boolean";
}

/** @param {_Type} value @returns {value is _Null} */
function is_Null(value) {
    return value === null;
}

/** @param {_Type} value @returns {value is _Array} */
function is_Array(value) {
    return Array.isArray(value);
}

/** @param {_Type} value @returns {value is _Object} */
function is_Object(value) {
    return value instanceof Map;
}

/** @param {_Type} value @returns {value is _Function} */
function is_Function(value) {
    return typeof value === "object" && value !== null && "arity" in value;
}

/**
 * @param {_Type} value
 * @returns {_TypeNames}
 */
function type(value) {
    if (is_Null(value)) return "null";
    if (is_Array(value)) return "array";
    if (is_Object(value)) return "object";
    if (is_Function(value)) return "function";
    return /** @type {"string" | "number" | "boolean"} */ (typeof value);
}

/** @type {Record<string, _Function>} */
const natives = {
    "write": {
        arity: 1,
        call(_, args) {
            console.log(args[0]);
            return null;
        }
    },
    "type": {
        arity: 1,
        call(_, args) {
            const value = args[0];

            if (value === null) { // null
                return "null";
            } else if (Array.isArray(value)) { // array
                return "array";
            } else if (typeof value === "object") {
                if (value instanceof Map) { // object
                    return "object";
                } else { // function
                    return "function";
                }
            } else { // string, number, boolean
                return typeof value;
            }
        }
    },
    "remainder": {
        arity: 2,
        call(_, args) {
            if (!is_Number(args[0]) || !is_Number(args[1])) {
                throw 0;
            }

            return args[0] % args[1];
        }
    },
    "power": {
        arity: 2,
        call(_, args) {
            if (!is_Number(args[0]) || !is_Number(args[1])) {
                throw 0;
            }

            return args[0] ** args[1];
        }
    },
    "count": {
        arity: 1,
        call(_, args) {
            if (!is_Array(args[0]) && !is_String(args[0])) {
                throw 0;
            }

            return args[0].length;
        }
    },
    "includes": {
        arity: 2,
        call(_, args) {
            if (!is_Array(args[0])) {
                throw 0;
            }

            return args[0].includes(args[1]);
        }
    },
    "has": {
        arity: 2,
        call(_, args) {
            if (!is_Object(args[0])) {
                throw 0;
            }

            return args[0].has(args[1]);
        }
    },
    "keys": {
        arity: 1,
        call(_, args) {
            if (!is_Object(args[0])) {
                throw 0;
            }

            return [...args[0].keys()];
        }
    },
    "values": {
        arity: 1,
        call(_, args) {
            if (!is_Object(args[0])) {
                throw 0;
            }

            return [...args[0].values()];
        }
    },
    "size": {
        arity: 1,
        call(_, args) {
            if (!is_Object(args[0])) {
                throw 0;
            }

            return args[0].size;
        }
    },
    "sorted": {
        arity: 1,
        call(_, args) {
            if (!is_Array(args[0])) {
                throw 0;
            }

            for (const item of args[0]) {
                if (!is_Number(item)) {
                    throw 0;
                }
            }

            return /** @type {_Number[]} */ ([...args[0]]).sort((a, b) => a - b);
        }
    },
    "reverse": {
        arity: 1,
        call(_, args) {
            if (!is_Array(args[0])) {
                throw 0;
            }

            return [...args[0]].reverse();
        }
    },
    "random": {
        arity: 0,
        call(_, __) {
            return Math.random();
        }
    },
    "floor": {
        arity: 1,
        call(_, args) {
            if (!is_Number(args[0])) {
                throw 0;
            }

            return Math.floor(args[0]);
        }
    },
    "ceil": {
        arity: 1,
        call(_, args) {
            if (!is_Number(args[0])) {
                throw 0;
            }

            return Math.ceil(args[0]);
        }
    },
    "absolute": {
        arity: 1,
        call(_, args) {
            if (!is_Number(args[0])) {
                throw 0;
            }

            return Math.abs(args[0]);
        }
    },
    "round": {
        arity: 1,
        call(_, args) {
            if (!is_Number(args[0])) {
                throw 0;
            }

            return Math.round(args[0]);
        }
    },
    "min": {
        arity: 1,
        call(_, args) {
            if (!is_Array(args[0])) {
                throw 0;
            }

            for (const item of args[0]) {
                if (!is_Number(item)) {
                    throw 0;
                }
            }

            return Math.min(.../** @type {_Number[]} */(args[0]))
        }
    },
    "max": {
        arity: 1,
        call(_, args) {
            if (!is_Array(args[0])) {
                throw 0;
            }

            for (const item of args[0]) {
                if (!is_Number(item)) {
                    throw 0;
                }
            }

            return Math.max(.../** @type {_Number[]} */(args[0]))
        }
    },
}


/**
 * Creates a new environment, optionally enclosing an outer scope.
 * 
 * @param {Environment} [enclosing]
 * @returns {Environment}
 */
function createEnvironment(enclosing = undefined) {
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
function declare(environment, name, value, reassignable = true) {
    environment.values.set(name, { value, reassignable });
}

/**
 *  
 * @param {Environment} environment 
 * @param {Token} name 
 * @param {_Type} value 
 */
function assign(environment, name, value) {
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
function assignAt(environment, distance, name, value) {
    ancestor(environment, distance).values.set(name.lexeme, value);
}


/**
 * Resolves a variable by searching the environment chain.
 * 
 * @param {Environment} environment 
 * @param {Token} name 
 * @returns {_Type}
 */
function lookup(environment, name) {
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
function lookupAt(environment, distance, name) {
    return /** @type {_Type} */ (ancestor(environment, distance).values.get(name));
}

/**
 * 
 * @param {Environment} environment 
 * @param {number} distance 
 * @returns {Environment}
 */
function ancestor(environment, distance) {
    let current = environment;

    for (let i = 0; i < distance; i++) {
        if (current.enclosing === undefined) {
            throw new Error("Invalid environment distance");
        }

        current = current.enclosing;
    }

    return current;
}




/**
 * Creates a runtime function object for a user-defined function.
 *
 * @param {FunctionDeclaration | FunctionExpression} declaration
 * @param {Environment} closure
 * @returns {_Function}
 */
function createFunction(declaration, closure) {
    return {
        arity: declaration.parameters.length,
        declaration,
        closure,

        call(interpreter, args) {
            const environment = createEnvironment(closure);

            for (let i = 0; i < declaration.parameters.length; i++) {
                declare(environment, declaration.parameters[i].lexeme, args[i]);
            }

            return interpretBlock(interpreter, declaration.body, environment);
        },
    };
}

/**
 * 
 * @param {*} diagnostics 
 * @returns {Interpreter}
 */
export function createInterpreter(diagnostics) {
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
 * @param {Interpreter} interpreter 
 * @param {Statement[] | Statement} statements 
 * @param {Environment} environment 
 */
function interpretBlock(interpreter, statements, environment) {
    const previous = interpreter.environment;

    try {
        interpreter.environment = environment;

        if (Array.isArray(statements)) {
            for (const statement of statements) {
                interpretStatement(interpreter, statement)
            }
        } else {
            interpretStatement(interpreter, statements)
        }

    } finally {
        interpreter.environment = previous;
    }
}


/**
 * 
 * @param {Interpreter} interpreter 
 * @param {Environment} environment 
 * @param {Statement} body 
 * @returns {"normal" | "exit" | "skip"}
 */
function runLoopBody(interpreter, environment, body) {
    const previous = interpreter.environment;

    try {
        interpreter.environment = environment;
        interpretStatement(interpreter, body);
        return "normal";
    } catch (error) {
        if (error === "exit") return "exit";
        if (error === "skip") return "skip";
        throw error;
    } finally {
        interpreter.environment = previous;
    }
}


/**
 * 
 * @param {Interpreter} interpreter 
 * @param {Expression} expression 
 * @returns {_Type}
 */
function interpretExpression(interpreter, expression) {
    return null
}

/**
 * 
 * @param {Interpreter} interpreter 
 * @param {Statement} statement 
 */
function interpretStatement(interpreter, statement) {
    switch (statement.type) {
        case "ExpressionStatement":
            interpretExpression(interpreter, statement.expression);
            break;

        case "VariableDeclaration": {
            const value = statement.initialiser !== undefined
                ? interpretExpression(interpreter, statement.initialiser)
                : null;

            declare(interpreter.environment, statement.name.lexeme, value);
            break;
        }

        case "ConstantDeclaration": {
            const value = interpretExpression(interpreter, statement.initialiser);
            declare(interpreter.environment, statement.name.lexeme, value, /* reassignable */ false);
            break;
        }

        case "FunctionDeclaration": {
            const fn = createFunction(statement, interpreter.environment);

            declare(interpreter.environment, statement.name.lexeme, fn);
            break;
        }

        case "BlockStatement": {
            interpretBlock(interpreter, statement.statements, createEnvironment(interpreter.environment));
            break;
        }

        case "IfStatement": {
            const condition = interpretExpression(interpreter, statement.condition);

            if (!is_Boolean(condition)) {
                throw 0;
            }

            if (condition) {
                interpretStatement(interpreter, statement.thenBranch);
            } else if (statement.elseBranch !== undefined) {
                interpretStatement(interpreter, statement.elseBranch);
            }

            break;
        }

        case "ReturnStatement": {
            const value = statement.expression !== undefined
                ? interpretExpression(interpreter, statement.expression)
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
                    const result = runLoopBody(interpreter, interpreter.environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }

                break;
            }

            const iterable = interpretExpression(interpreter, statement.iterable);

            // loop number with value
            if (is_Number(iterable)) {
                if (statement.binding?.index !== undefined) {
                    throw new Error("Numeric loops do not support index bindings");
                }

                for (let i = 0; i < iterable; i++) {
                    const environment = createEnvironment(interpreter.environment);

                    if (statement.binding?.value !== undefined) {
                        // 1-based counting
                        declare(environment, statement.binding.value.lexeme, i + 1);
                    }

                    const result = runLoopBody(interpreter, environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            // loop condition
            else if (is_Boolean(iterable)) {
                if (statement.binding !== undefined) {
                    throw new Error("Boolean loops do not support bindings");
                }

                while (interpretExpression(interpreter, statement.iterable) === true) {
                    const result = runLoopBody(interpreter, interpreter.environment, statement.body);

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
                    const environment = createEnvironment(interpreter.environment);

                    if (statement.binding?.index !== undefined) {
                        // 1-based index
                        declare(environment, statement.binding.index.lexeme, i + 1);
                    }

                    if (statement.binding?.value !== undefined) {
                        declare(environment, statement.binding.value.lexeme, iterable[i]);
                    }

                    const result = runLoopBody(interpreter, environment, statement.body);

                    if (result === "exit") break;
                    if (result === "skip") continue;
                }
            }

            // loop object with key, value
            else if (is_Object(iterable)) {
                for (const [key, value] of iterable) {
                    const environment = createEnvironment(interpreter.environment);

                    if (statement.binding?.index !== undefined) {
                        // key binding
                        declare(environment, statement.binding.index.lexeme, key);
                    }

                    if (statement.binding?.value !== undefined) {
                        // value binding
                        declare(environment, statement.binding.value.lexeme, value);
                    }

                    const result = runLoopBody(interpreter, environment, statement.body);

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
                    const value = iterable.call(interpreter, []);

                    // returning null ends the iteration
                    if (value === null) {
                        break;
                    }

                    const environment = createEnvironment(interpreter.environment);

                    if (statement.binding?.value !== undefined) {
                        declare(environment, statement.binding.value.lexeme, value);
                    }

                    const result = runLoopBody(interpreter, environment, statement.body);

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
 * @param {Interpreter} interpreter 
 * @param {Statement[]} statements 
 */
export function interpret(interpreter, statements) {
    for (const statement of statements) {
        interpretStatement(interpreter, statement);
    }
}