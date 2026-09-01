#!/usr/bin/env node

// @ts-check

import path from "node:path";
import "../interpreter/types.js";
import { runFile } from "../runner/runFile.js";
import { red, bold, blue } from "ansis"


export function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error(red(bold("Please provide a Nikrisht file to run.")));
        console.error(blue("Example:"), "nki input.nki")
        process.exit(1);
    }

    if (args.length > 1) {
        console.error(red(bold("Too many arguments. Nikrisht can only run one file at a time.")));
        process.exit(1);
    }
    
    if (path.extname(args[0]).toLowerCase() !== ".nki") {
        console.error(red(bold("Invalid file format. Please provide a .nki file to run.")));
        process.exit(1);
    }

    runFile(args[0]);
}


main()
