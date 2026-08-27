
// @ts-check

import { interpret, createInterpreter } from "../interpreter/interpreter.js"
import { report } from "./report.js";
import { ImplementationError } from "../interpreter/diagnostics/classes.js";


/**
 * 
 * @param {string} source 
 * @param {string} path 
 * @param {Omit<Omit<Host, "colors">, "escape"> & { colors?: Host["colors"] } & { escape?: Host["escape"]}} givenHost
 * @returns {Interpreter}
 */
export function run(source, path, givenHost) {
    /**
     * @param {string} text
     * @returns {string}
     */
    function identity(text) {
        return text;
    }

    /** @type {Host["colors"]} */
    // @ts-ignore, Dynamic proxy fallback for all color keys
    const noOpColors = new Proxy({}, { get: () => identity });

    /** @type {Host} */
    const host = {
        ...givenHost,
        colors: givenHost.colors ?? noOpColors,
        escape: givenHost.escape ?? identity,
    };

    const interpreter = createInterpreter(source, host);

    const messages = {
        interpreterHasCrashed: `${host.colors.red(host.colors.bold("Interpreter has crashed"))}

${host.colors.bold("Suggestions:")}
    * Check your code for missing or incorrect base cases in recursive functions.
    * Optimize heavy data structures or reduce nested loop complexity.
    * If this is a valid workload, try increasing the stack size limit via configuration.`,

        implementationError: (/** @type {string}*/message) => `${host.colors.red(host.colors.bold("Implementation error:"))} ${message}

This is an internal error and should not have occured. 

Please report this error along with the source code to: ${host.colors.blue("https://github.com/LadyBeGood/nikrisht/issues")}`
    }

    try {
        interpret(interpreter);
    } catch (error) {
        interpreter.success = false;
        if (error instanceof RangeError && error.message.includes("Maximum call stack size exceeded")) {
            host.logger(messages.interpreterHasCrashed);
        } else if (error instanceof ImplementationError) {
            host.logger(messages.implementationError(error.message));
        } else {
            host.logger(error instanceof Error ? `${error.message}\n${error.stack}` : String(error));
        }

        return interpreter;
    }

    report(interpreter.diagnostics, interpreter.source, path, host);

    return interpreter;
}





