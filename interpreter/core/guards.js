// @ts-check

import "../types.js";

/** 
 * @param {_Type} value 
 * @returns {value is _Number} 
 */
export function is_Number(value) {
    return typeof value === "number";
}

/** 
 * @param {_Type} value 
 * @returns {value is _String}
 */
export function is_String(value) {
    return typeof value === "string";
}

/** 
 * @param {_Type} value
 * @returns {value is _Boolean} 
 */
export function is_Boolean(value) {
    return typeof value === "boolean";
}

/** 
 * @param {_Type} value 
 * @returns {value is _Null}
 */
export function is_Null(value) {
    return value === null;
}

/** 
 * @param {_Type} value 
 * @returns {value is _Array} 
 */
export function is_Array(value) {
    return Array.isArray(value);
}

/** 
 * @param {_Type} value 
 * @returns {value is _Object} 
 */
export function is_Object(value) {
    return value instanceof Map;
}

/** 
 * @param {_Type} value 
 * @returns {value is _Function} 
 */
export function is_Function(value) {
    return typeof value === "object" && value !== null && "arity" in value;
}

/**
 * @param {_Type} value
 * @returns {_TypeNames}
 */
export function type(value) {
    if (is_Null(value)) return "null";
    if (is_Array(value)) return "array";
    if (is_Object(value)) return "object";
    if (is_Function(value)) return "function";
    return /** @type {"string" | "number" | "boolean"} */ (typeof value);
}
