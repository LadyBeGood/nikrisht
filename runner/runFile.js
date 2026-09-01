// @ts-check

import { readFileSync } from "node:fs";
import { red, yellow, bold, dim, blue } from "ansis";
import { run } from "./run.js";
import path from "node:path";


/**
 * Reads a file from the disk and interprets it through the Nikrisht interpreter.  
 * @param {string} filePath The relative system path to the `.nki` file.
 */
export function runFile(filePath) {
    let source;
    try {
        source = readFileSync(filePath, "utf8");
    } catch (error) {
        console.error("Error reading file: ", /** @type {Error} */(error).message);
        return;
    }

    const absolutePath = path.resolve(filePath);
    run({
        source, 
        path: absolutePath, 
        host: {
            log: console.log,
        },
        colors: {
            red,
            yellow,
            bold,
            dim,
            blue
        }
    });
}
