#!/usr/bin/env node

// @ts-check

import { readFileSync } from "node:fs";
import { interpret, createInterpreter } from "../interpreter.js"
import { lex, createLexer } from "../phases/lexer.js"


/**
 * Reads a file from the disk and interprets it through the Nikrisht interpreter.  
 * @param {string} path The relative system path to the `.nki` file.
 */
async function interpretFile(path) {
    let source;
    try {
        source = readFileSync(path, "utf8");
    } catch (error) {
        console.error("Error reading file: ", /** @type {Error} */ (error).message);
        process.exit(1);
    }

    const interpreter = createInterpreter(source, "node");
    // const lexer = createLexer(interpreter);
    interpret(interpreter);
    // lex(lexer);
    console.log(JSON.stringify(interpreter.diagnostics, null, 4));

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
