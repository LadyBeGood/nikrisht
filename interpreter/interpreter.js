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
            if (!is_Array(args[0]) || !is_String(args[0])) {
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
 * @param {Environment} [enclosing]
 * @returns {Environment}
 */
function createEnvironment(enclosing = undefined) {
    return {
        enclosing: enclosing,
        values: new Map(),
    }
}


export function createInterpreter(diagnostics) {
    const globals = createEnvironment();

    for ()
}