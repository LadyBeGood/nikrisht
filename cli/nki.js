#!/usr/bin/env node

// @ts-check

import { readFileSync } from "node:fs";
import { interpret, createInterpreter } from "../interpreter/interpreter.js"
import { report } from "./report.js";
import {red, bold, link} from "ansis";
import { ImplementationError } from "../interpreter/diagnostics/classes.js";


const messages = {
    interpreterHasCrashed: `${red.bold("Interpreter has crashed")}

${bold("Suggestions:")}
    * Check your code for missing or incorrect base cases in recursive functions.
    * Optimize heavy data structures or reduce nested loop complexity.
    * If this is a valid workload, try increasing the stack size limit via configuration.`,
    
    implementationError: (/** @type {string}*/message) => `${red.bold("Implementation error:")} ${message}

This is an internal error and should not have occured. 

Please report this error along with source code to: ${"https://github.com/LadyBeGood/nikrisht/issues"}`
}


/**
 * Reads a file from the disk and interprets it through the Nikrisht interpreter.  
 * @param {string} path The relative system path to the `.nki` file.
 */
async function interpretFile(path) {
    let source;
    try {
        source = readFileSync(path, "utf8");
    } catch (error) {
        console.error("Error reading file: ", /** @type {Error} */(error).message);
        process.exit(1);
    }

    const interpreter = createInterpreter(source, "node");


    try {
        interpret(interpreter);
    } catch (error) {
        if (error instanceof RangeError && error.message.includes("Maximum call stack size exceeded")) {
            // console.error(messages.interpreterHasCrashed);
            console.error(messages.implementationError(error.message));
        } else if (error instanceof ImplementationError) {
        }

        process.exit(1);
    }

    report(interpreter.diagnostics, interpreter.source, path);

    process.exit(interpreter.success ? 0 : 1);

}



export async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error("Usage: nki <input.nki>");
        process.exit(1);
    }

    await interpretFile(args[0]);
}


main()
