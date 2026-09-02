// @ts-check

import { ImplementationError } from "../diagnostics/classes.js";
import { error } from "../diagnostics/report.js";
import "../types.js";
import { is_Array, is_Boolean, is_Function, is_Null, is_Number, is_Object, is_String, type } from "./guards.js";


/**
 * 
 * @param {_Type} data 
 * @param {number} [indent=1] 
 * @param {boolean} [quoteStrings=false] 
 * @returns {string}
 */
export function stringify(data, indent = 1, quoteStrings = false) {
    if (is_String(data)) {
        return quoteStrings ? `"${data}"` : data;
    } else if (is_Number(data) || is_Boolean(data) || is_Null(data)) {
        return String(data).toLowerCase();
    } else if (is_Array(data)) {
        /** 
         * 0 => Symbol after opening "[", and each 2
         * 1 => Symbol after each 0
         * 2 => Symbol after each stringified data.
         * @type {(string|number)[]} 
         */
        let result = ["["];
        result.push(0);

        for (let i = 0; i < data.length; i++) {
            result.push(1);
            result.push(stringify(data[i], indent + 1, true));
            result.push(2);
            result.push(0);
        }
        
        const singleLine = result.join("").length <= 50;

        if (singleLine) {
            // Remove trailing comma
            if (data.length > 0) {
                result.pop(); // 0
                result.pop(); // 2
            } else {
                result.pop(); // Remove initial 0 marker
            }

            result = result.map(item => {
                if (item === 0 || item === 1) {
                    return "";
                } else if (item === 2) {
                    return ", "
                } 
                return item;
            });
            result.push("]");
        } else {
            result = result.map(item => {
                if (item === 0) {
                    return "\n";
                } else if (item === 1) {
                    return "    ".repeat(indent);
                } else if (item === 2) {
                    return ","
                }
                return item;
            });
            result.push("    ".repeat(indent - 1))
            result.push("]");
        }
        
        
        return result.join("");
    } else if (is_Function(data)) {
        if (data.closure === undefined) {
            return "<native function>";
        } else if (data.declaration?.name === undefined) {
            return "<anonymous function>";
        } else {
            return `<${data.declaration.name?.lexeme} function>`
        }
    } else if (is_Object(data)) {
        /**
         * 0 => Symbol after opening "{", and each 2
         * 1 => Symbol after each 0
         * 2 => Symbol after each stringified data.
         * @type {(string|number)[]} 
         */
        let result = ["{"];
        result.push(0);

        for (const [key, value] of data.entries()) {
            result.push(1);
            result.push(stringify(key, indent + 1, true));
            result.push(": ");
            result.push(stringify(value, indent + 1, true));
            result.push(2);
            result.push(0);
        }

        const singleLine = result.join("").length <= 50;

        if (singleLine) {
            // Remove trailing comma
            if (data.size > 0) {
                result.pop(); // 0
                result.pop(); // 2
            } else {
                result.pop(); // Remove initial 0 marker
            }

            result = result.map(item => {
                if (item === 0 || item === 1) {
                    return "";
                } else if (item === 2) {
                    return ", "
                }
                return item;
            });
            result.push("}");
        } else {
            result = result.map(item => {
                if (item === 0) {
                    return "\n";
                } else if (item === 1) {
                    return "    ".repeat(indent);
                } else if (item === 2) {
                    return ", "
                }
                return item;
            });
            result.push("    ".repeat(indent - 1))
            result.push("}");
        }

        return result.join("");
    }

    throw new ImplementationError("Trying to stringify an unhandled data type.");
}



export const nativeConstants = {
    "pi": Math.PI,
    "nan": NaN,
    "infinity": Infinity,
}


/** @type {Record<string, _Function>} */
export const nativeFunctions = {
    "write": {
        arity: 1,
        call(args, _, executor) {
            executor.interpreter.host.log(stringify(args[0]));
            return null;
        }
    },
    "type": {
        arity: 1,
        call(args) {
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
    // Unless this key is written in this computed style, typescript checker confuses this with the
    // Object.toString() method and gives stupid errors.
    ["" + "toString"]: {
        arity: 1,
        call(args, expression, executor) {
            if (args[1] !== undefined) {
                if (!is_Boolean(args[1])) {
                    error(executor.interpreter, expression.arguments[0], `Function "toString" expects a boolean as second argument, "quoteStrings", but got "${type(args[0])}"`, "executor");
                }
            }
            return stringify(args[0], undefined, args[1]);
        }
    },
    "toNumber": {
        arity: 1,
        call(args) {
            return Number(args[0]);
        }
    },
    "toBoolean": {
        arity: 1,
        call(args) {
            return Boolean(args[0]);
        }
    },
    "remainder": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Number(args[0]) || !is_Number(args[1])) {
                error(executor.interpreter, expression.arguments[0], `Function 'remainder' requires numeric arguments, but got '${type(args[0])}' and '${type(args[1])}'`, "executor");
            }

            return args[0] % args[1];
        }
    },
    "power": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `First argument of "power" must be a number, but got "${type(args[0])}"`, "executor");
            }
            if (!is_Number(args[1])) {
                error(executor.interpreter, expression.arguments[1], `Second argument of "power" must be a number, but got "${type(args[1])}"`, "executor");
            }

            return args[0] ** args[1];
        }
    },
    "count": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0]) && !is_String(args[0]) && !is_Object(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "count" expects a string, array or object, but got "${type(args[0])}"`, "executor");
            }

            if (is_Object(args[0])) {
                return args[0].size;
            }

            return args[0].length;
        }
    },
    "includes": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "includes" expects an array as its first argument, but got "${type(args[0])}"`, "executor");
            }

            return args[0].includes(args[1]);
        }
    },
    "has": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Object(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "has" expects an object as its first argument, but got "${type(args[0])}"`, "executor");
            }

            return args[0].has(args[1]);
        }
    },
    "keys": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Object(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "keys" expects an object, but got "${type(args[0])}"`, "executor");
            }

            return [...args[0].keys()];
        }
    },
    "values": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Object(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "values" expects an object, but got "${type(args[0])}"`, "executor");
            }

            return [...args[0].values()];
        }
    },
    "sort": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "sort" expects an array, but got "${type(args[0])}"`, "executor");
            }

            for (let i = 0; i < args[0].length; i++) {
                if (!is_Number(args[0][i])) {
                    error(executor.interpreter, /** @type {ArrayExpression} */ (expression.arguments[0]).elements[i], `Function "sort" requires all array items to be numbers, but found "${type(args[0][i])}"`, "executor");
                }
            }

            return /** @type {_Number[]} */ ([...args[0]]).sort((a, b) => a - b);
        }
    },
    "reverse": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "reverse" expects an array, but got "${type(args[0])}"`, "executor");
            }

            return [...args[0]].reverse();
        }
    },
    "random": {
        arity: 0,
        call(__) {
            return Math.random();
        }
    },
    "floor": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "floor" expects a number, but got "${type(args[0])}"`, "executor");
            }

            return Math.floor(args[0]);
        }
    },
    "ceil": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "ceil" expects a number, but got "${type(args[0])}"`, "executor");
            }

            return Math.ceil(args[0]);
        }
    },
    "absolute": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "absolute" expects a number, but got "${type(args[0])}"`, "executor");
            }

            return Math.abs(args[0]);
        }
    },
    "round": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "round" expects a number, but got "${type(args[0])}"`, "executor");
            }

            return Math.round(args[0]);
        }
    },
    "min": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "min" expects an array, but got "${type(args[0])}"`, "executor");
            }

            for (let i = 0; i < args[0].length; i++) {
                if (!is_Number(args[0][i])) {
                    error(executor.interpreter, /** @type {ArrayExpression} */ (expression.arguments[0]).elements[i], `Function "min" requires all array items to be numbers, but found "${type(args[0][i])}"`, "executor");
                }
            }

            return Math.min(.../** @type {_Number[]} */(args[0]));
        }
    },
    "max": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "max" expects an array, but got "${type(args[0])}"`, "executor");
            }

            for (let i = 0; i < args[0].length; i++) {
                if (!is_Number(args[0][i])) {
                    error(executor.interpreter, /** @type {ArrayExpression} */(expression.arguments[0]).elements[i], `Function "max" requires all array items to be numbers, but found "${type(args[0][i])}"`, "executor");
                }
            }

            return Math.max(.../** @type {_Number[]} */(args[0]))
        }
    },
    "slice": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Array(args[0]) && !is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "slice" expects an array or string as its first argument, but got "${type(args[0])}"`, "executor");
            }

            if (args[2] === undefined) {
                args[2] = args[0].length;
            }

            if (!is_Number(args[1])) {
                error(executor.interpreter, expression.arguments[1], `Slice start index must be a number, but got "${type(args[1])}"`, "executor");
            }
            if (!is_Number(args[2])) {
                error(executor.interpreter, expression.arguments[2], `Slice end index must be a number, but got "${type(args[2])}"`, "executor");
            }

            return args[0].slice(args[1] - 1, args[2]);
        }
    },
    "put": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "put" expects an array as its first argument, but got "${type(args[0])}"`, "executor");
            }

            return args[0].push(args[1]);
        }
    },
    "pop": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "pop" expects an array as its first argument, but got "${type(args[0])}"`, "executor");
            }

            return args[0].pop() ?? null;
        }
    },
    "split": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "split" expects a string as its first argument, but got "${type(args[0])}"`, "executor");
            }
            if (!is_String(args[1])) {
                error(executor.interpreter, expression.arguments[0], `Function "split" expects a string as its second argument, but got "${type(args[0])}"`, "executor");
            }

            return args[0].split(args[1]);
        }
    },
    "join": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "join" expects an array as its first argument, but got "${type(args[0])}"`, "executor");
            }
            if (!is_String(args[1])) {
                error(executor.interpreter, expression.arguments[0], `Function "join" expects a string as its second argument, but got "${type(args[0])}"`, "executor");
            }

            return args[0].join(args[1]);
        }
    },
    "sum": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Array(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "sum" expects an array, but got "${type(args[0])}"`, "executor");
            }

            for (let i = 0; i < args[0].length; i++) {
                if (!is_Number(args[0][i])) {
                    error(executor.interpreter, /** @type {ArrayExpression} */(expression.arguments[0]).elements[i], `Function "sum" requires all array items to be numbers, but found "${type(args[0][i])}"`, "executor");
                }
            }

            return /** @type {_Number[]} */ (args[0]).reduce((a, b) => a + b, 0);
        }
    },
    "startsWith": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "startsWith" expects a string as its first argument, but got "${type(args[0])}"`, "executor");
            }
            if (!is_String(args[1])) {
                error(executor.interpreter, expression.arguments[1], `Function "startsWith" expects a string as its second argument, but got "${type(args[1])}"`, "executor");
            }

            return args[0].startsWith(args[1]);
        }
    },
    "endsWith": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "endsWith" expects a string as its first argument, but got "${type(args[0])}"`, "executor");
            }
            if (!is_String(args[1])) {
                error(executor.interpreter, expression.arguments[1], `Function "endsWith" expects a string as its second argument, but got "${type(args[1])}"`, "executor");
            }

            return args[0].endsWith(args[1]);
        }
    },
    "lowercase": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "lowercase" expects a string, but got "${type(args[0])}"`, "executor");
            }

            return args[0].toLowerCase();
        }
    },
    "uppercase": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "uppercase" expects a string, but got "${type(args[0])}"`, "executor");
            }

            return args[0].toUpperCase();
        }
    },
    "capitalise": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "capitalise" expects a string, but got "${type(args[0])}"`, "executor");
            }

            if (args[0].length === 0) return "";
            return args[0][0].toUpperCase() + args[0].slice(1).toLowerCase();
        }
    },
    "titlecase": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "titlecase" expects a string, but got "${type(args[0])}"`, "executor");
            }

            return args[0]
                .toLowerCase()
                .split(" ")
                .map(word => word.length === 0 ? "" : word[0].toUpperCase() + word.slice(1))
                .join(" ");
        }
    },
    "truncate": {
        arity: 2,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "truncate" expects a number as its first argument, but got "${type(args[0])}"`, "executor");
            }

            return Math.trunc(args[0]);
        }
    },
    "log": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "log" expects a number as its first argument, but got "${type(args[0])}"`, "executor");
            }

            let base = 10;
            if (args[1] !== undefined) {
                if (!is_Number(args[1])) {
                    error(executor.interpreter, expression.arguments[1], `Function "log" expects a number as its second argument, but got "${type(args[1])}"`, "executor");
                }
                base = args[1];
            }

            return Math.log(args[0]) / Math.log(base);
        }
    },
    "trim": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_String(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "trim" expects a string as its first argument, but got "${type(args[0])}"`, "executor");
            }

            if (args[1] === undefined) {
                return args[0].trim();
            }

            if (!is_String(args[1])) {
                error(executor.interpreter, expression.arguments[1], `Function "trim" expects "left" or "right" as its second argument, but got "${type(args[1])}"`, "executor");
            }

            if (args[1] === "left") {
                return args[0].trimStart();
            } else if (args[1] === "right") {
                return args[0].trimEnd();
            } else {
                error(executor.interpreter, expression.arguments[1], `Function "trim" second argument must be "left" or "right", but got "${args[1]}"`, "executor");
            }
        }
    },
    "isNan": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "isNan" expects a number as its first argument, but got "${type(args[0])}"`, "executor");
            }
            return Number.isNaN(args[0]);
        }
    },
    "isFinite": {
        arity: 1,
        call(args, expression, executor) {
            if (!is_Number(args[0])) {
                error(executor.interpreter, expression.arguments[0], `Function "isFinite" expects a number as its first argument, but got "${type(args[0])}"`, "executor");
            }
            return Number.isFinite(args[0]);
        }
    },
}

