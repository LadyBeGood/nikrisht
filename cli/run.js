
// @ts-check

import { readFileSync } from "node:fs";
import { interpret, createInterpreter } from "../interpreter/interpreter.js"
import { report } from "./report.js";
import { red, bold, blue } from "ansis";
import { ImplementationError } from "../interpreter/diagnostics/classes.js";

const messages = {
    interpreterHasCrashed: `${red.bold("Interpreter has crashed")}

${bold("Suggestions:")}
    * Check your code for missing or incorrect base cases in recursive functions.
    * Optimize heavy data structures or reduce nested loop complexity.
    * If this is a valid workload, try increasing the stack size limit via configuration.`,

    implementationError: (/** @type {string}*/message) => `${red.bold("Implementation error:")} ${message}

This is an internal error and should not have occured. 

Please report this error along with the source code to: ${blue("https://github.com/LadyBeGood/nikrisht/issues")}`
}


/**
 * 
 * @param {string} source 
 * @param {string} path 
 * @param {Host} host 
 * @returns {Interpreter}
 */
export function run(source, path, host) {
    const interpreter = createInterpreter(source, host);
    const logger = host.logger;

    try {
        interpret(interpreter);
    } catch (error) {
        interpreter.success = false;
        if (error instanceof RangeError && error.message.includes("Maximum call stack size exceeded")) {
            logger(messages.interpreterHasCrashed);
        } else if (error instanceof ImplementationError) {
            logger(messages.implementationError(error.message));
        } else {
            logger(JSON.stringify(error));
        }

        return interpreter;
    }

    report(interpreter.diagnostics, interpreter.source, path, logger);

    return interpreter;
}




/**
 * Reads a file from the disk and interprets it through the Nikrisht interpreter.  
 * @param {string} path The relative system path to the `.nki` file.
 */
export async function runFile(path) {
    let source;
    try {
        source = readFileSync(path, "utf8");
    } catch (error) {
        console.error("Error reading file: ", /** @type {Error} */(error).message);
        return;
    }

    run(source, path, {logger: console.log});
}

