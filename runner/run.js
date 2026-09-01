
// @ts-check

import "./types.js";
import { interpret, createInterpreter } from "../interpreter/interpreter.js"
import { report } from "./report.js";
import { ImplementationError } from "../interpreter/diagnostics/classes.js";

/**
 * @param {Object} options
 * @param {string} options.source 
 * @param {string} options.path 
 * @param {Host} options.host
 * @param {function(string): string} [options.escape]
 * @param {Colors} [options.colors]
 * @returns {Interpreter}
 */
export function run({ source, path, host, colors, escape }) {
    /**
     * @param {string} text
     * @returns {string}
     */
    function identity(text) {
        return text;
    }
        
    /** @type {Colors} */
    // @ts-ignore, Dynamic proxy fallback for all color keys
    const noOpColors = new Proxy({}, { get: () => identity });

    colors = colors ?? noOpColors;
    escape = escape ?? identity;

    const interpreter = createInterpreter(source, host);

    const messages = {
        interpreterHasCrashed: `${colors.red(colors.bold("Interpreter has crashed"))}

${colors.bold("Suggestions:")}
    * Check your code for missing or incorrect base cases in recursive functions.
    * Optimize heavy data structures or reduce nested loop complexity.
    * If this is a valid workload, try increasing the stack size limit via configuration.`,

        implementationError: (/** @type {string}*/message) => `${colors.red(colors.bold("Implementation error:"))} ${message}

This is an internal error and should not have occured. 

Please report this error along with the source code to: ${colors.blue("https://github.com/LadyBeGood/nikrisht/issues")}`
    }

    try {
        interpret(interpreter);
    } catch (error) {
        interpreter.success = false;
        if (error instanceof RangeError && error.message.includes("Maximum call stack size exceeded")) {
            host.log(messages.interpreterHasCrashed);
        } else if (error instanceof ImplementationError) {
            host.log(messages.implementationError(error.message));
        } else {
            host.log(error instanceof Error ? `${error.message}\n${error.stack}` : String(error));
        }

        return interpreter;
    }

    report(interpreter.diagnostics, interpreter.source, path, host, colors, escape);

    return interpreter;
}





